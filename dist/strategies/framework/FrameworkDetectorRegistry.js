"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkDetectorRegistry = void 0;
const NextJsDetector_1 = require("./NextJsDetector");
const ViteDetector_1 = require("./ViteDetector");
const PostgresDetector_1 = require("./PostgresDetector");
const RedisDetector_1 = require("./RedisDetector");
const PythonDetector_1 = require("./PythonDetector");
const RubyDetector_1 = require("./RubyDetector");
/**
 * Registry (Singleton) that holds all framework detectors and applies
 * the Strategy pattern: the first detector whose canDetect() returns true wins.
 *
 * Order matters — more specific detectors must come before generic ones.
 */
class FrameworkDetectorRegistry {
    constructor() {
        this.detectors = [
            new NextJsDetector_1.NextJsDetector(),
            new ViteDetector_1.ViteDetector(),
            new PostgresDetector_1.PostgresDetector(),
            new RedisDetector_1.RedisDetector(),
            new PythonDetector_1.PythonDetector(),
            new RubyDetector_1.RubyDetector(),
        ];
    }
    static getInstance() {
        if (!FrameworkDetectorRegistry.instance) {
            FrameworkDetectorRegistry.instance = new FrameworkDetectorRegistry();
        }
        return FrameworkDetectorRegistry.instance;
    }
    /**
     * Registers a custom detector at the front of the chain (highest priority).
     */
    register(detector) {
        this.detectors.unshift(detector);
    }
    /**
     * Returns the first matching FrameworkInfo or null if no detector matches.
     */
    resolve(processName, directory, containerName) {
        for (const detector of this.detectors) {
            if (detector.canDetect(processName, directory, containerName)) {
                return detector.detect(processName, directory, containerName);
            }
        }
        return null;
    }
}
exports.FrameworkDetectorRegistry = FrameworkDetectorRegistry;
//# sourceMappingURL=FrameworkDetectorRegistry.js.map