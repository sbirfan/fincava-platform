// Hidden from real users (off-screen + unfocusable, not display:none since
// some bots specifically skip display:none fields). Any non-empty value on
// submit means a bot filled the form — the server silently no-ops those.
export default function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
