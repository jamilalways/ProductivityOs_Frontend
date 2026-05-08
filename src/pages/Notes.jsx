import NoteEditor from '../components/notes/NoteEditor';
export default function Notes() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: '-0.03em' }}>Learning Journal</h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>
          Capture learnings, problems, and solutions · Markdown supported
        </p>
      </div>
      <NoteEditor />
    </div>
  );
}
