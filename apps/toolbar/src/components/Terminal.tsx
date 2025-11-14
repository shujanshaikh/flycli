import { useEffect, useRef } from "react"
import { WS_URL } from "../lib/constant"
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalComponentProps {
    enabled: boolean;
}

export function TerminalComponent({ enabled }: TerminalComponentProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstanceRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const currentCommandRef = useRef<string>("");

    useEffect(() => {
        if (!enabled || !terminalRef.current) {
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.dispose();
                terminalInstanceRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        const terminal = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 14,
            letterSpacing: 0,
            lineHeight: 1,
            fontWeight: '400',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            allowTransparency: false,
            allowProposedApi: true,
            theme: {
                background: '#161a20',
                foreground: '#c6d0f5',
                cursor: '#80cbc4',
                cursorAccent: '#161a20',
                black:   '#191724',
                red:     '#eb6f92',
                green:   '#a3be8c',
                yellow:  '#f6c177',
                blue:    '#31748f',
                magenta: '#c4a7e7',
                cyan:    '#9ccfd8',
                white:   '#e0def4',
                brightBlack:   '#555169',
                brightRed:     '#eb6f92',
                brightGreen:   '#a3be8c',
                brightYellow:  '#f6c177',
                brightBlue:    '#31748f',
                brightMagenta: '#c4a7e7',
                brightCyan:    '#9ccfd8',
                brightWhite:   '#f0f0fa',
            },
        });

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        
        terminalInstanceRef.current = terminal;
        terminal.loadAddon(fitAddon);
        terminal.open(terminalRef.current);
        
        setTimeout(() => {
            fitAddon.fit();
        }, 0);
        
        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
        });
        
        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "terminal_result") {
                if (data.stdout) {
                    const stdout = data.stdout.toString().replace(/\r?\n/g, '\r\n');
                    terminal.write(stdout);
                    if (!stdout.endsWith('\r\n')) {
                        terminal.write('\r\n');
                    }
                }
                if (data.stderr) {
                    const stderr = data.stderr.toString().replace(/\r?\n/g, '\r\n');
                    terminal.write(stderr);
                    if (!stderr.endsWith('\r\n')) {
                        terminal.write('\r\n');
                    }
                }
                terminal.write('\r\n$ ');
            }
        };

        const handleError = () => {
            console.error("Error connecting to terminal");
            terminal.writeln('\r\n\x1b[31mError: Failed to connect to terminal server\x1b[0m');
        };

        ws.addEventListener('message', handleMessage);
        ws.addEventListener('error', handleError);

        ws.addEventListener('open', () => {
            terminal.writeln('\r\n\x1b[32mConnected to local terminal\x1b[0m');
            terminal.write('\r\n$ ');
        });

        terminal.onData((data) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                return;
            }

            if (data === '\r' || data === '\n') {
                if (currentCommandRef.current.trim()) {
                    terminal.write('\r\n');
                    const commandParts = currentCommandRef.current.trim().split(/\s+/);
                    wsRef.current.send(JSON.stringify({ type: "terminal", command: commandParts }));
                    currentCommandRef.current = '';
                } else {
                    terminal.write('\r\n$ ');
                }
            }
            else if (data === '\x7f' || data === '\b') {
                if (currentCommandRef.current.length > 0) {
                    currentCommandRef.current = currentCommandRef.current.slice(0, -1);
                    terminal.write('\b \b');
                }
            }
            else if (data === '\x03') {
                terminal.write('^C\r\n$ ');
                currentCommandRef.current = '';
            }
            else if (data >= ' ') {
                currentCommandRef.current += data;
                terminal.write(data);
            }
        });

        return () => {
            resizeObserver.disconnect();
            ws.removeEventListener('message', handleMessage);
            ws.removeEventListener('error', handleError);
            ws.close();
            wsRef.current = null;
            fitAddon.dispose();
            fitAddonRef.current = null;
            terminal.dispose();
            terminalInstanceRef.current = null;
        };
    }, [enabled]);

    if (!enabled) {
        return null;
    }

    return (
        <div className="terminal-container h-full w-full bg-black overflow-hidden">
            <div 
                ref={terminalRef} 
                className="h-full w-full"
                style={{
                    padding: 0,
                    margin: 0,
                }}
            />
        </div>
    );
}