import React, { useState, useRef, useEffect } from 'react';
import { MockShell, CommandResult } from '../game/terminal/MockShell';

interface TerminalHistoryEntry {
  command: string;
  result: CommandResult;
  prompt: string;
}

interface TerminalViewProps {
  onCommandExecuted?: (cmd: string, result: CommandResult) => void;
  initialPromptText?: string;
  autoFocus?: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  onCommandExecuted,
  autoFocus = true,
}) => {
  const [shell] = useState(() => new MockShell());
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const prompt = shell.getPrompt();
      const res = shell.execute(inputVal);

      if (res.clear) {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, { command: inputVal, result: res, prompt }]);
      }

      if (inputVal.trim()) {
        setCommandHistory(prev => [...prev, inputVal.trim()]);
        setHistoryIndex(-1);
      }

      if (onCommandExecuted) {
        onCommandExecuted(inputVal, res);
      }

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic Tab autocomplete for known files
      const tokens = inputVal.split(' ');
      const lastToken = tokens[tokens.length - 1];
      const commonSuggestions = [
        '/var/log/nginx/error.log',
        '/var/log/syslog',
        'backend-app',
        'auth-service',
        'status',
        'restart',
        '--previous',
      ];
      const match = commonSuggestions.find(s => s.startsWith(lastToken));
      if (match) {
        tokens[tokens.length - 1] = match;
        setInputVal(tokens.join(' '));
      }
    }
  };

  return (
    <div className="terminal-view" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-view__header">
        <div className="terminal-view__dots">
          <span className="terminal-view__dot terminal-view__dot--red" />
          <span className="terminal-view__dot terminal-view__dot--yellow" />
          <span className="terminal-view__dot terminal-view__dot--green" />
        </div>
        <span className="terminal-view__title">bash — devops@k8s-node (xterm emulation)</span>
      </div>

      <div className="terminal-view__body">
        <div className="terminal-view__welcome">
          DevOps City Diagnostic Terminal (v2.4.0-k8s)
          <br />
          Type <span className="text-emerald-400">help</span> to view available commands. Pipes (<span className="text-emerald-400">|</span>) and regex (<span className="text-emerald-400">grep</span>) supported.
        </div>

        {history.map((entry, idx) => (
          <div key={idx} className="terminal-view__entry">
            <div className="terminal-view__cmd-line">
              <span className="terminal-view__prompt">{entry.prompt}</span>
              <span className="terminal-view__cmd">{entry.command}</span>
            </div>
            {entry.result.output && (
              <pre className={`terminal-view__output ${entry.result.exitCode !== 0 ? 'terminal-view__output--error' : ''}`}>
                {entry.result.output}
              </pre>
            )}
          </div>
        ))}

        <div className="terminal-view__input-line">
          <span className="terminal-view__prompt">{shell.getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-view__input"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
