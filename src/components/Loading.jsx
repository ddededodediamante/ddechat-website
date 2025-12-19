export default function Loading({ size = "40px", iconOnly = false }) {
  let result;

  if (iconOnly)
    result = <i className="loadingAnim" style={{ width: size, height: size }} />;
  else
    result = (
      <div className="loadingAnim" style={{ fontSize: size }}>
        <div className="spinner"></div>
        <div>Loading...</div>
      </div>
    );

  return result;
}
