"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appRoot = require("app-root-path");
const Promise = require("bluebird");
const Bunyan = require("bunyan");
const Lodash = require("lodash");
const microb_1 = require("microb");
class CellpackLog extends microb_1.Cellpack {
    init() {
        this.config = this.environment.get("cellpacks")["cellpack-log"];
        if (this.config.debug !== undefined)
            this.debug = this.config.debug;
        else
            this.config = this.environment.get('debug', false);
        let logPath = this.config.path || `${appRoot}/logs`;
        this.logger = Bunyan.createLogger({
            name: "cellpack-log",
            src: true,
            streams: [{
                    level: this.config.level || Bunyan.INFO,
                    type: 'rotating-file',
                    path: `${logPath}/microb.log`,
                    period: this.config.period || '1d',
                    count: this.config.count || 7
                }, {
                    level: Bunyan.ERROR,
                    type: 'rotating-file',
                    path: `${logPath}/errors.log`,
                    period: this.config.period || '1d',
                    count: this.config.count || 7
                }]
        });
        let logger = this;
        this.transmitter.on("log.**", function (log) { logger.log(this.event, log); });
        return Promise.resolve();
    }
    log(event, log) {
        if (Lodash.isString(log)) {
            log = {
                type: "info",
                msg: log
            };
        }
        let type = log.type;
        let msg = log.msg;
        delete log.type;
        delete log.msg;
        let l = log;
        l.event = event;
        if (type === "trace")
            this.logger.trace(l, msg);
        else if (type === "debug")
            this.logger.debug(l, msg);
        else if (type === "info")
            this.logger.info(l, msg);
        else if (type === "error")
            this.logger.error(l, msg);
        else if (type === "fatal")
            this.logger.fatal(l, msg);
        else
            this.logger.warn(l, msg);
    }
}
exports.default = CellpackLog;
