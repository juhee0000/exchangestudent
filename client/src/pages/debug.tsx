export default function Debug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>
      <p>If you can see this, React is working!</p>
      <div>
        <h2>Test Results:</h2>
        <ul>
          <li>✓ React rendering works</li>
          <li>✓ TypeScript compiles</li>
          <li>✓ Vite serves the app</li>
        </ul>
      </div>
    </div>
  );
}
