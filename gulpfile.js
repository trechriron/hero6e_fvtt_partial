const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const archiver = require('archiver');
const stringify = require('json-stringify-pretty-compact');
const typescript = require('typescript');

const ts = require('gulp-typescript');
const less = require('gulp-less');
const git = require('gulp-git');
const sourcemaps = require('gulp-sourcemaps');

const argv = require('yargs').argv;

const systemData = require('./src/system.json');
const systemName = systemData.name;

function getConfig() {
    const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
    let config;

    if (fs.existsSync(configPath)) {
        config = fs.readJSONSync(configPath);
        return config;
    }
}

function getManifest() {
    const json = {};

    if (fs.existsSync('src')) {
        json.root = 'src';
    } else {
        json.root = 'dist';
    }

    const modulePath = path.join(json.root, 'module.json');
    const systemPath = path.join(json.root, 'system.json');

    if (fs.existsSync(modulePath)) {
        json.file = fs.readJSONSync(modulePath);
        json.name = 'module.json';
    } else if (fs.existsSync(systemPath)) {
        json.file = fs.readJSONSync(systemPath);
        json.name = 'system.json';
    } else {
        return;
    }

    return json;
}

/**
 * TypeScript transformers
 * @returns {typescript.TransformerFactory<typescript.SourceFile>}
 */
function createTransformer() {
    /**
     * @param {typescript.Node} node
     */
    function shouldMutateModuleSpecifier(node) {
        if (
            !typescript.isImportDeclaration(node) &&
            !typescript.isExportDeclaration(node)
        )
            return false;
        if (node.moduleSpecifier === undefined) return false;
        if (!typescript.isStringLiteral(node.moduleSpecifier)) return false;
        if (
            !node.moduleSpecifier.text.startsWith('./') &&
            !node.moduleSpecifier.text.startsWith('../')
        )
            return false;
        if (path.extname(node.moduleSpecifier.text) !== '') return false;
        return true;
    }

    /**
     * Transforms import/export declarations to append `.js` extension
     * @param {typescript.TransformationContext} context
     */
    function importTransformer(context) {
        return (node) => {
            /**
             * @param {typescript.Node} node
             */
            function visitor(node) {
                if (shouldMutateModuleSpecifier(node)) {
                    if (typescript.isImportDeclaration(node)) {
                        const newModuleSpecifier = typescript.createLiteral(
                            `${node.moduleSpecifier.text}.js`
                        );
                        return typescript.updateImportDeclaration(
                            node,
                            node.decorators,
                            node.modifiers,
                            node.importClause,
                            newModuleSpecifier
                        );
                    } else if (typescript.isExportDeclaration(node)) {
                        const newModuleSpecifier = typescript.createLiteral(
                            `${node.moduleSpecifier.text}.js`
                        );
                        return typescript.updateExportDeclaration(
                            node,
                            node.decorators,
                            node.modifiers,
                            node.exportClause,
                            newModuleSpecifier
                        );
                    }
                }
                return typescript.visitEachChild(node, visitor, context);
            }

            return typescript.visitNode(node, visitor);
        };
    }

    return importTransformer;
}

/********************/
/*		BUILD		*/

/********************/

/**
 * Build TypeScript
 */
async function buildTS() {
    try {
        if (fs.existsSync('src/tsconfig.json')) {
            const tsConfig = ts.createProject('tsconfig.json', {
                getCustomTransformers: (_program) => ({
                    after: [createTransformer()],
                }),
            });
            return gulp.src('src/**/*.ts').pipe(tsConfig()).pipe(gulp.dest('dist'));
        }
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Build Less
 */
async function buildLess() {
    try {
        gulp.src(`src/styles/${systemName}.less`)
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/styles'));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Copy static files
 */
async function copyFiles() {
    const statics = [
        'assets',
        'lang',
        'module',
        'packs',
        'templates',
        `${systemName}.js`,
        'module.json',
        'system.json',
        'template.json'
    ];
    try {
        for (const file of statics) {
            if (fs.existsSync(path.join('src', file))) {
                await fs.copy(path.join('src', file), path.join('dist', file));
            }
        }
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

async function copyDistFilesToDir(dir) {
    const statics = [
        'assets',
        'lang',
        'module',
        'packs',
        'styles',
        'templates',
        `${systemName}.js`,
        'module.json',
        'system.json',
        'template.json'
    ];
    try {
        for (const file of statics) {
            if (fs.existsSync(path.join('dist', file))) {
                await fs.copy(path.join('dist', file), path.join(dir, file));
            }
        }
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
    gulp.watch('src/**/*.ts', { ignoreInitial: false }, buildTS);
    gulp.watch(`src/styles/${systemName}.less`, { ignoreInitial: false }, buildLess);
    gulp.watch(
        ['src/fonts', 'src/lang', 'src/templates', 'src/*.json'],
        { ignoreInitial: false },
        copyFiles
    );
}

/********************/
/*		CLEAN		*/

/********************/

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function clean() {
    const name = path.basename(path.resolve('.'));
    const files = [];

    // If the project uses TypeScript
    if (fs.existsSync(path.join('src', `${systemName}.ts`))) {
        files.push(
            'assets',
            'lang',
            'module',
            'packs',
            'styles',
            'templates',
            `${systemName}.js`,
            'module.json',
            'system.json',
            'template.json'
        );
    }

    // If the project uses vanilla Javascript
    if (fs.existsSync(path.join('src', `${systemName}.js`))) {
        files.push(
            'assets',
            'lang',
            'module',
            'packs',
            'styles',
            'templates',
            `${systemName}.js`,
            'module.json',
            'system.json',
            'template.json'
        );
    }

    console.log(' ', chalk.yellow('Files to clean:'));
    console.log('   ', chalk.blueBright(files.join('\n    ')));

    // Attempt to remove the files
    try {
        for (const filePath of files) {
            await fs.remove(path.join('dist', filePath));
        }
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

/********************/
/*		LINK		*/

/********************/

/**
 * Link build to User Data folder
 */
async function copyDistToDataSystems() {
    const name = path.basename(path.resolve('.'));
    const config = fs.readJSONSync('foundryconfig.json');

    let destDir;
    try {
        if (
            fs.existsSync(path.resolve('.', 'src', 'module.json'))
        ) {
            destDir = 'modules';
        } else if (
            fs.existsSync(path.resolve('.', 'src', 'system.json'))
        ) {
            destDir = 'systems';
        } else {
            throw Error(
                `Could not find ${chalk.blueBright(
                    'module.json'
                )} or ${chalk.blueBright('system.json')}`
            );
        }

        let linkDir;
        if (config.dataPath) {
            if (!fs.existsSync(path.join(config.dataPath, 'Data')))
                throw Error('User Data path invalid, no Data directory found');

            linkDir = path.join(config.dataPath, 'Data', destDir, name);
        } else {
            throw Error('No User Data path defined in foundryconfig.json');
        }

        if (argv.clean || argv.c) {
            console.log(
                chalk.yellow(`Removing build in ${chalk.blueBright(linkDir)}`)
            );

            await fs.remove(linkDir);
            return Promise.resolve();
        }

        if (!fs.existsSync(linkDir)) {
            fs.mkdirSync(linkDir)
        }

        console.log(
            chalk.green(`Copying build to ${chalk.blueBright(linkDir)}`)
        );
        await copyDistFilesToDir(linkDir);
        return Promise.resolve();

    } catch (err) {
        return Promise.reject(err);
    }
}

/*********************/
/*		PACKAGE		 */

/*********************/

/**
 * Package build
 */
async function packageBuild() {
    const manifest = getManifest();

    return new Promise((resolve, reject) => {
        try {
            // Remove the package dir without doing anything else
            if (argv.clean || argv.c) {
                console.log(chalk.yellow('Removing all packaged files'));
                fs.removeSync('package');
                return;
            }

            // Ensure there is a directory to hold all the packaged versions
            fs.ensureDirSync('package');

            // Initialize the zip file
            const zipName = `${manifest.file.name}-v${manifest.file.version}.zip`;
            const zipFile = fs.createWriteStream(path.join('package', zipName));
            const zip = archiver('zip', { zlib: { level: 9 } });

            zipFile.on('close', () => {
                console.log(chalk.green(zip.pointer() + ' total bytes'));
                console.log(
                    chalk.green(`Zip file ${zipName} has been written`)
                );
                return resolve();
            });

            zip.on('error', (err) => {
                throw err;
            });

            zip.pipe(zipFile);

            // Add the directory with the final code
            zip.directory('dist/', manifest.file.name);

            zip.finalize();
        } catch (err) {
            return reject(err);
        }
    });
}

/*********************/
/*		PACKAGE		 */

/*********************/

/**
 * Update version and URLs in the manifest JSON
 */
function updateManifest(cb) {
    const packageJson = fs.readJSONSync('package.json');
    const config = getConfig(),
        manifest = getManifest(),
        rawURL = config.rawURL,
        repoURL = config.repository,
        manifestRoot = manifest.root;

    if (!config) cb(Error(chalk.red('foundryconfig.json not found')));
    if (!manifest) cb(Error(chalk.red('Manifest JSON not found')));
    if (!rawURL || !repoURL)
        cb(
            Error(
                chalk.red(
                    'Repository URLs not configured in foundryconfig.json'
                )
            )
        );

    try {
        const version = argv.update || argv.u;

        /* Update version */

        const versionMatch = /^(\d{1,}).(\d{1,}).(\d{1,})$/;
        const currentVersion = manifest.file.version;
        let targetVersion = '';

        if (!version) {
            cb(Error('Missing version number'));
        }

        if (versionMatch.test(version)) {
            targetVersion = version;
        } else {
            targetVersion = currentVersion.replace(
                versionMatch,
                (substring, major, minor, patch) => {
                    console.log(
                        substring,
                        Number(major) + 1,
                        Number(minor) + 1,
                        Number(patch) + 1
                    );
                    if (version === 'major') {
                        return `${Number(major) + 1}.0.0`;
                    } else if (version === 'minor') {
                        return `${major}.${Number(minor) + 1}.0`;
                    } else if (version === 'patch') {
                        return `${major}.${minor}.${Number(patch) + 1}`;
                    } else {
                        return '';
                    }
                }
            );
        }

        if (targetVersion === '') {
            return cb(Error(chalk.red('Error: Incorrect version arguments.')));
        }

        if (targetVersion === currentVersion) {
            return cb(
                Error(
                    chalk.red(
                        'Error: Target version is identical to current version.'
                    )
                )
            );
        }
        console.log(`Updating version number to '${targetVersion}'`);

        packageJson.version = targetVersion;
        manifest.file.version = targetVersion;

        /* Update URLs */

        const result = `${rawURL}/v${manifest.file.version}/package/${manifest.file.name}-v${manifest.file.version}.zip`;

        manifest.file.url = repoURL;
        manifest.file.manifest = `${rawURL}/master/${manifestRoot}/${manifest.name}`;
        manifest.file.download = result;

        const prettyProjectJson = stringify(manifest.file, {
            maxLength: 35,
            indent: '\t',
        });

        fs.writeJSONSync('package.json', packageJson, { spaces: '\t' });
        fs.writeFileSync(
            path.join(manifest.root, manifest.name),
            prettyProjectJson,
            'utf8'
        );

        return cb();
    } catch (err) {
        cb(err);
    }
}

async function gitAdd() {
    try {
        gulp.src('package').pipe(git.add({ args: '--no-all' }));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

async function gitCommit() {
    try {
        gulp.src('./*').pipe(
            git.commit(`v${getManifest().file.version}`, {
                args: '-a',
                disableAppendPaths: true,
            }));
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

async function gitTag() {
    const manifest = getManifest();
    try {
        git.tag(
            `v${manifest.file.version}`,
            `Updated to ${manifest.file.version}`);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

gulp.task('clean', clean);
gulp.task('watch', buildWatch);
gulp.task('package', packageBuild);
gulp.task('update', updateManifest);
gulp.task('copySystem', copyDistToDataSystems);
gulp.task('copyDist', copyFiles);
gulp.task('execGit', gulp.series(gitAdd, gitCommit, gitTag));
gulp.task('execBuild', gulp.series(buildTS, buildLess));
gulp.task('deploy', gulp.series('clean', 'execBuild', 'copyDist', 'copySystem'));
gulp.task('build', gulp.series('clean', 'execBuild', 'copyDist'));
gulp.task('publish', gulp.series('clean', 'update', 'execBuild', 'package', 'execGit'));
