import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/components/base/base.component';
import { BuildLogService } from '../../../core/services/build-log.service';
import { delay } from 'rxjs/operators';
import { ProjectLogsService } from '@core/services/projects-logs.service';
import { Subject } from 'rxjs';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

export type LogLevel = 'WRN' | 'ERR' | 'FTL' | 'INF' | 'DBG' | 'VRB';

type Action = {
  level: LogLevel;
  date: Date;
  body?: string;
  number: number;
};

@Component({
  selector: 'app-logging-terminal',
  templateUrl: './logging-terminal.component.html',
  styleUrls: ['./logging-terminal.component.sass'],
})
export class LoggingTerminalComponent extends BaseComponent implements OnInit {
  private log = new Subject<string>();
  private step = 1;
  private logRegExr = /^\[(\d+) (.+) (\w+)\](.*)/;

  private lineNumber: number = 1;

  showLevels: boolean = false;
  showTimeStamps: boolean = false;

  buildSteps: Map<number, [boolean, Action[]]> = new Map<
    number,
    [boolean, Action[]]
  >();

  constructor(private buildService: BuildLogService, private logsService: ProjectLogsService) {
    super();
  }

  ngOnInit(): void {
    // this.buildService
    //   .getTestBuildLog()
    //   .pipe(delay(0))
    //   .subscribe((line) => this.buildLog(line));
    this.logsService.logsListener(this.log);
    this.log.subscribe((message) => {
      this.buildLog(this.formatLog(message));
    });
  }

  loggin() {
    this.log.subscribe((line) => {
      this.buildLog(line);
    });
  }

  clear() {
    this.buildSteps.clear();
    this.lineNumber = 0;
  }

  setExpand(key: number) {
    this.buildSteps.get(key)[0] = !this.buildSteps.get(key)[0];
  }

  private buildLog(line: string) {
    const [step, action] = this.parseLine(line);
    this.appendLog(step, action);
  }

  private parseLine(line: string): [number, Action] {
    const a: Action = {} as Action;

    a.number = this.lineNumber++;

    const logMatchArray = line.match(this.logRegExr);

    // @ts-ignore
    a.date = new Date(logMatchArray[2]);
    a.level = logMatchArray[3] as LogLevel;
    a.body = logMatchArray[4];

    const step = parseInt(logMatchArray[1]);

    return [step, a];
  }

  private appendLog(step: number, a: Action) {
    if (!this.buildSteps.has(step)) {
      this.buildSteps.set(step, [false, []]);
    }

    this.buildSteps.get(step)[1].push(a);
  }

  // Temporary solution for converting logs to existing format
  private formatLog(line: string) {
    const log: Log = JSON.parse(line);
    const { timestamp, message } = log;
    return `[${this.step++} ${timestamp} INF] ${message}`;
  }
}

class Log {
  timestamp: Date;
  message: string;
  buildId: number;
  buildStep: number;
}
