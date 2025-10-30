export const runTerminalCommand = (command: string | string[]) => {
    //console.log(command , "command from terminal function");
    try {
        // Handle both string and array inputs
        const cmdArray = Array.isArray(command) 
            ? command.filter(c => c.trim() !== '') // Filter out empty strings from array
            : command.split(' ').filter(c => c.trim() !== ''); // Split string and filter empty parts
        
        // If command array is empty, return early
        if (cmdArray.length === 0) {
            return {
                stdout: '',
                stderr: 'No command provided',
                success: false,
            };
        }

        const result = Bun.spawnSync({
            cmd: cmdArray,
            stdout: 'pipe',
            stderr: 'pipe',
            cwd: process.cwd(),
          });
          return {
            stdout: result.stdout.toString(),
            stderr: result.stderr.toString(),
            success: result.success,
          };
    } catch (error : any) {
        return {
            stdout: '',
            stderr: error.message,
            success: false,
        };
    }

};