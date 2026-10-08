const storageKey = "control-de-polizas";
const form = document.querySelector("#policy-form");
const list = document.querySelector("#policy-list");
const template = document.querySelector("#policy-template");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
const emptyState = document.querySelector("#empty-state");
const clearAll = document.querySelector("#clear-all");

let policies = loadPolicies();

function loadPolicies() {
  try {
    const savedPolicies = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(savedPolicies) ? savedPolicies : [];
  } catch (error) {
    console.error("No se pudieron cargar las pólizas guardadas.", error);
    return [];
  }
}

function savePolicies() {
  localStorage.setItem(storageKey, JSON.stringify(policies));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
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
    element.querySelector(".number").textContent = policy.number;
    element.querySelector(".insured").textContent = policy.insured;
    element.querySelector(".policy-type").textContent = policy.type;
    element.querySelector(".insurer").textContent = policy.insurer;
    element.querySelector(".expiration").textContent = formatDate(policy.expiration);
    element.querySelector(".amount").textContent = formatAmount(policy.amount);
    deleteButton.setAttribute("aria-label", `Eliminar póliza ${policy.number}`);
    list.append(element);
  });

  summary.textContent = policies.length === 1
    ? "1 póliza registrada"
    : `${policies.length} pólizas registradas`;
  emptyState.hidden = policies.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const number = document.querySelector("#policy-number").value.trim();
  const insurer = document.querySelector("#insurer").value.trim();
  const insured = document.querySelector("#insured").value.trim();
  const type = formData.get("policy-type");
  const expiration = document.querySelector("#expiration").value;
  const amount = Number(document.querySelector("#insured-amount").value);

  if (!number || !insurer || !insured || !type || !expiration || Number.isNaN(amount) || amount < 0) {
    message.textContent = "Completa correctamente todos los datos de la póliza.";
    return;
  }

  policies.unshift({
    id: crypto.randomUUID(),
    number,
    insurer,
    insured,
    type,
    expiration,
    amount,
  });
  savePolicies();
  form.reset();
  message.textContent = "";
  render();
  document.querySelector("#policy-number").focus();
});

list.addEventListener("click", (event) => {
  if (!event.target.matches(".delete")) return;

  const id = event.target.closest("tr").dataset.id;
  policies = policies.filter((policy) => policy.id !== id);
  savePolicies();
  render();
});

clearAll.addEventListener("click", () => {
  if (!policies.length) {
    message.textContent = "No hay pólizas para eliminar.";
    return;
  }

  policies = [];
  savePolicies();
  message.textContent = "";
  render();
});

render();
