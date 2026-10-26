const GOLD = "#C9A96E";

export function OgMarkup() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0d0d",
        backgroundImage:
          "radial-gradient(circle at 50% 35%, rgba(201,169,110,0.16), rgba(13,13,13,0) 60%)",
        fontFamily: "serif",
        position: "relative",
      }}
    >
      {/* corner accents */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          width: 64,
          height: 64,
          borderTop: `2px solid ${GOLD}`,
          borderLeft: `2px solid ${GOLD}`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 48,
          width: 64,
          height: 64,
          borderTop: `2px solid ${GOLD}`,
          borderRight: `2px solid ${GOLD}`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 48,
          width: 64,
          height: 64,
          borderBottom: `2px solid ${GOLD}`,
          borderLeft: `2px solid ${GOLD}`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 48,
          width: 64,
          height: 64,
          borderBottom: `2px solid ${GOLD}`,
          borderRight: `2px solid ${GOLD}`,
          opacity: 0.8,
        }}
      />

      <div
        style={{
          display: "flex",
          letterSpacing: 10,
          fontSize: 26,
          fontWeight: 600,
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        Buffalo, New York
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 108,
          fontStyle: "italic",
          color: "#f5f3ef",
          lineHeight: 1,
        }}
      >
        2Gether
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 48,
          letterSpacing: 14,
          textTransform: "uppercase",
          color: "#f5f3ef",
          marginTop: 8,
        }}
      >
        Hair Studio
      </div>

      <div
        style={{
          display: "flex",
          width: 360,
          height: 2,
          marginTop: 36,
          marginBottom: 36,
          background: `linear-gradient(90deg, rgba(201,169,110,0) 0%, ${GOLD} 50%, rgba(201,169,110,0) 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          fontSize: 26,
          fontFamily: "sans-serif",
          letterSpacing: 4,
          color: "#9c9c9c",
          textTransform: "uppercase",
        }}
      >
        Where Style and Community Come Together
      </div>
    </div>
  );
}
