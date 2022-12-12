// tracing.js
'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { Resource } = require('@opentelemetry/resources');

const { SimpleSpanProcessor, ConsoleSpanExporter } = require ("@opentelemetry/sdk-trace-base");

const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");

const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const { HttpInstrumentation } = require ('@opentelemetry/instrumentation-http');

const { ExpressInstrumentation } = require ('@opentelemetry/instrumentation-express');

// Register server-related instrumentation
registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
    ]
});

// The Trace Exporter exports the data to Honeycomb and uses
// the environment variables for endpoint, service name, and API Key.
const traceExporter = new OTLPTraceExporter();

const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
