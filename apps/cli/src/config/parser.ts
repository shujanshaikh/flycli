import { Command, InvalidArgumentError } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

function myParseInt(value: string) {
    // parseInt takes a string and a radix
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

function myParsePath(value: string) {
    const parsedValue = path.resolve(value);
    if (!fs.existsSync(parsedValue)) {
        throw new InvalidArgumentError('Path does not exist.');
    }
    return parsedValue;
}

const program = new Command();

// Store command info for later use
let commandExecuted: string | undefined;
let telemetrySubcommand: string | undefined;

program
    .name('jafdotdev')
    .description('Jafdotdev is a tool for building websites with AI')
    .version('0.0.1')
    .option<number>(
        '-p, --port [port]',
        'The port on which the jafdotdev-wrapped app will run',
        myParseInt,
    )
    .option<number>(
        '-a, --app-port <app-port>',
        'The port of the developed app that jafdotdev will wrap with the toolbar',
        myParseInt,
    )
    .option<string>(
        '-w, --workspace <workspace>',
        'The path to the repository of the developed app',
        myParsePath,
        process.cwd(),
    )
    .option('-s, --silent', 'Will not request user input or guide through setup')
    .option('-v, --verbose', 'Output debug information to the CLI')
    .parse(process.argv);


// Add telemetry command with subcommands
const telemetryCommand = program
    .command('telemetry')
    .description('Manage telemetry settings for Jafdotdev CLI');

telemetryCommand
    .command('status')
    .description('Show current telemetry configuration')
    .action(() => {
        commandExecuted = 'telemetry';
        telemetrySubcommand = 'status';
    });

telemetryCommand
    .command('set <level>')
    .description('Set telemetry level (off, anonymous, full)')
    .action((level) => {
        commandExecuted = 'telemetry';
        telemetrySubcommand = 'set';
        // Store the level for later use
        (program as any).telemetryLevel = level;
    });


// Default action for main program
program.action(() => {
    commandExecuted = 'main';
});

const rawArgs = program.args.slice(2);

const doubleDashIndex = rawArgs.indexOf('--');
let jafdotdevArgs = rawArgs
let wrappedCommand: string[] = [];
let hasWrappedCommand = false;


if (doubleDashIndex !== -1) {
    hasWrappedCommand = true;
    jafdotdevArgs = rawArgs.slice(0, doubleDashIndex);
    wrappedCommand = rawArgs.slice(doubleDashIndex + 1);
}

const hasBridgeMode = jafdotdevArgs.includes('-b');

// Validate bridge mode conflicts before parsing (to avoid path validation)
if (hasBridgeMode) {
    console.error(
        'Bridge mode (-b) is incompatible with other arguments',
    );
    process.exit(1);
}

program.parse([...process.argv.slice(0, 2), ...jafdotdevArgs]);

let port: number | undefined;
let appPort: number | undefined;
let workspace: string | undefined;
let silent: boolean | undefined;
let verbose: boolean | undefined;
let bridgeMode: boolean


const options = program.opts();


if (commandExecuted === "telemetry") {
    // Set default values for telemetry commands
    port = undefined;
    appPort = undefined;
    workspace = process.cwd();
    silent = false;
    verbose = false;
    bridgeMode = false;
} else {
    const {
        port: parsedPort,
        appPort: parsedAppPort,
        workspace: parsedWorkspace,
        silent: parsedSilent,
        verbose: parsedVerbose,
        bridgeMode: parsedBridgeMode,
    } = (options as {
        port?: number;
        appPort?: number;
        workspace?: string;
        silent?: boolean;
        verbose?: boolean;
        bridgeMode?: boolean;
    })


    // Validate port conflicts
    if (!parsedBridgeMode && appPort && port === appPort) {
        throw new Error('port and app-port cannot be the same');
    }

    port = parsedPort;
    appPort = parsedAppPort;
    workspace = parsedWorkspace;
    silent = parsedSilent;
    verbose = parsedVerbose;
    bridgeMode = parsedBridgeMode!;
}



// Export the parsed values
export {
    port,
    appPort,
    workspace,
    silent,
    verbose,
    bridgeMode,
    commandExecuted,
    telemetrySubcommand,
    wrappedCommand,
    hasWrappedCommand,
  };
  
  // Export telemetry level if set command was used
  export const telemetryLevel = (program as any).telemetryLevel as
    | string
    | undefined;
  