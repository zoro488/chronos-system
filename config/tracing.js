// Tracing configuration for monitoring and debugging
export const tracing = {
  enabled: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  trace: (category, message, data = {}) => {
    if (!tracing.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${category}] ${message}`, data);
  },
  
  error: (category, message, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${category}] ${message}`, error);
  },
  
  warn: (category, message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${category}] ${message}`, data);
  },
};

// Mock span for tracing operations
class MockSpan {
  constructor(name) {
    this.name = name;
    this.attributes = {};
  }
  
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  
  setStatus(status) {
    this.status = status;
  }
  
  end() {
    // Span ended
  }
}

// Trace Firestore operations
export async function traceFirestoreOperation(operationName, collection, callback) {
  const span = new MockSpan(`firestore.${operationName}`);
  span.setAttribute('collection', collection);
  
  try {
    const result = await callback(span);
    span.setStatus({ code: 'OK' });
    return result;
  } catch (error) {
    span.setStatus({ code: 'ERROR', message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

// Trace transactions
export async function traceTransaction(transactionName, callback) {
  const span = new MockSpan(`transaction.${transactionName}`);
  
  try {
    const result = await callback(span);
    span.setStatus({ code: 'OK' });
    return result;
  } catch (error) {
    span.setStatus({ code: 'ERROR', message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

export default tracing;
