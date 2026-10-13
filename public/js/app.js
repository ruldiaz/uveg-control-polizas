const form = document.querySelector("#policy-form");
const list = document.querySelector("#policy-list");
const template = document.querySelector("#policy-template");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
const emptyState = document.querySelector("#empty-state");
const insurerSelect = document.querySelector("#insurer");

let policies = [];

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la solicitud.");
  }

  return data;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatAmount(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function render() {
  list.replaceChildren();

  policies.forEach((policy) => {
    const element = template.content.cloneNode(true);
    const row = element.querySelector("tr");
    const deleteButton = element.querySelector(".delete");

    row.dataset.id = policy.id;
    element.querySelector(".number").textContent = policy.numeroPoliza;
    element.querySelector(".insured").textContent = policy.asegurado;
    element.querySelector(".policy-type").textContent = policy.tipoSeguro;
    element.querySelector(".insurer").textContent = policy.aseguradora;
    element.querySelector(".expiration").textContent = formatDate(policy.fechaVencimiento);
    element.querySelector(".amount").textContent = formatAmount(policy.sumaAsegurada);
    deleteButton.setAttribute("aria-label", `Eliminar póliza ${policy.numeroPoliza}`);
    list.append(element);
  });

  summary.textContent = policies.length === 1
    ? "1 póliza registrada"
    : `${policies.length} pólizas registradas`;
  emptyState.hidden = policies.length > 0;
}

async function loadInsurers() {
  const insurers = await request("/api/aseguradoras");

  insurers.forEach((insurer) => {
    const option = document.createElement("option");
    option.value = insurer.id;
    option.textContent = insurer.nombre;
    insurerSelect.append(option);
  });
}

async function loadPolicies() {
  policies = await request("/api/polizas");
  render();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const policy = {
    numeroPoliza: document.querySelector("#policy-number").value.trim(),
    aseguradoraId: Number(insurerSelect.value),
    asegurado: document.querySelector("#insured").value.trim(),
    tipoSeguro: document.querySelector("#policy-type").value,
    fechaVencimiento: document.querySelector("#expiration").value,
    sumaAsegurada: Number(document.querySelector("#insured-amount").value),
  };

  try {
    await request("/api/polizas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policy),
    });

    form.reset();
    await loadPolicies();
    document.querySelector("#policy-number").focus();
  } catch (error) {
    message.textContent = error.message;
  }
});

list.addEventListener("click", async (event) => {
  if (!event.target.matches(".delete")) {
    return;
  }

  const row = event.target.closest("tr");
  const number = row.querySelector(".number").textContent;

  if (!window.confirm(`¿Deseas eliminar la póliza ${number}?`)) {
    return;
  }

  try {
    await request(`/api/polizas/${row.dataset.id}`, { method: "DELETE" });
    message.textContent = "";
    await loadPolicies();
  } catch (error) {
    message.textContent = error.message;
  }
});

async function initialize() {
  try {
    await Promise.all([loadInsurers(), loadPolicies()]);
  } catch (error) {
    message.textContent = "No se pudo cargar la información de la aplicación.";
    console.error(error);
  }
}

initialize();
