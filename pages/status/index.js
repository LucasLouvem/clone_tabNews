import useSWR from "swr";

async function fectchAPI(key) {
  const reponse = await fetch(key);
  const responseBody = await reponse.json();
  return responseBody;
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fectchAPI, {
    refreshInterval: 2000,
  });

  const updateAt =
    !isLoading && data
      ? new Date(data.update_at).toLocaleString("pt-BR")
      : "Carregando...";

  const isHealthy = !error && data;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Status do Banco de Dados</h1>
            <p style={styles.subtitle}>Atualizado em: {updateAt}</p>
          </div>

          <div style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            {isHealthy ? "Operacional" : "Indisponível"}
          </div>
        </div>

        <div style={styles.grid}>
          <StatusItem label="Versão" value={data?.version ?? "Carregando..."} />

          <StatusItem
            label="Máximo de Conexões"
            value={data?.max_connections ?? "Carregando..."}
          />

          <StatusItem
            label="Conexões Abertas"
            value={data?.opened_connections ?? "Carregando..."}
          />
        </div>
      </section>
    </main>
  );
}

function StatusItem({ label, value }) {
  return (
    <div style={styles.item}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "720px",
    background: "#ffffff",
    border: "1px solid #d8dee4",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "32px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#24292f",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#57606a",
    fontSize: "14px",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#dafbe1",
    color: "#116329",
    border: "1px solid #aceebb",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#2da44e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },

  item: {
    border: "1px solid #d8dee4",
    borderRadius: "12px",
    padding: "20px",
    background: "#f6f8fa",
  },

  label: {
    display: "block",
    color: "#57606a",
    fontSize: "14px",
    marginBottom: "8px",
  },

  value: {
    color: "#24292f",
    fontSize: "24px",
  },
};
