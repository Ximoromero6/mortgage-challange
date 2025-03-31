document.addEventListener("DOMContentLoaded", async () => {
  console.log("Aplicación iniciada 🚀");

  const mortgageForm = document.getElementById("mortgageForm");
  const clearAllButton = document.getElementById("clearAllButton");
  const resultsContainer = document.querySelector(
    ".mortgage-calculator__results"
  );

  //Reset form button, removes the focus from the radiobuttons as well
  clearAllButton.addEventListener("click", () => {
    document.querySelectorAll(".mortgage-calculator__radio").forEach((l) => {
      l.classList.remove("active");
    });
    mortgageForm.reset();
  });

  //Add active effect to the radiobuttons if selected
  document.querySelectorAll(".mortgage-calculator__radio").forEach((label) => {
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      document.querySelectorAll(".mortgage-calculator__radio").forEach((l) => {
        l.classList.remove("active");
      });
      if (input.checked) {
        label.classList.add("active");
      }
    });
  });

  //Add decimal to amount input
  const amountInput = document.getElementById("amount");

  amountInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = new Intl.NumberFormat("de-DE").format(value);

    e.target.value = value;
  });

  // Function to handle error message creation and removal
  const handleErrorMessage = (container, message) => {
    let errorMessage = container.querySelector(".errorMessage");
    if (!errorMessage) {
      errorMessage = document.createElement("p");
      errorMessage.innerText = message;
      errorMessage.className = "errorMessage";
      container.append(errorMessage);
    }
  };

  // Function to remove error message
  const removeErrorMessage = (container) => {
    const errorMessage = container.querySelector(".errorMessage");
    if (errorMessage) {
      errorMessage.remove();
    }
  };

  //Form validation
  mortgageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    //Input number validation
    const fields = mortgageForm.querySelectorAll(
      ".mortgage-calculator__field:not(.mortgage-calculator__field--inline), .mortgage-calculator__subfield"
    );

    fields.forEach((field) => {
      const input = field.querySelector("input[type=number]");

      if (!input) return;

      const inputContainer = field.querySelector(
        ".mortgage-calculator__input-container"
      );

      if (!inputContainer) {
        console.error(
          "No se encontró .mortgage-calculator__input-container en",
          field
        );
        return;
      }

      if (input.value.trim() === "") {
        inputContainer.classList.add("error");
        const icon = inputContainer.querySelector(".icon");
        if (icon) icon.classList.add("error");

        // Add the error message to the field container
        handleErrorMessage(field, "This field is required");

        isValid = false;
      } else {
        inputContainer.classList.remove("error");
        const icon = inputContainer.querySelector(".icon");
        if (icon) icon.classList.remove("error");

        // Remove the error message if the field is filled
        removeErrorMessage(field);
      }
    });

    //Input radio validation
    const radios = document.querySelectorAll("input[name='type']");
    const isChecked = Array.from(radios).some((radio) => radio.checked);

    const radioContainer = radios[0].closest(".mortgage-calculator__field");
    if (!isChecked) {
      handleErrorMessage(radioContainer, "This field is required");

      isValid = false;
    } else {
      removeErrorMessage(radioContainer);
    }

    if (!isValid) return;

    let amount = parseFloat(amountInput.value.replace(/\./g, ""));
    let term = parseInt(document.getElementById("term").value);
    let interestRate = parseFloat(document.getElementById("interest").value);
    let mortgageType = document.querySelector(
      "input[name='type']:checked"
    ).value;

    if (isNaN(amount) || isNaN(term) || isNaN(interestRate)) {
      alert("Please enter valid numbers");
      return;
    }

    // Calcular número total de pagos (meses)
    let n = term * 12;

    // Calcular tasa de interés mensual
    let r = interestRate / 100 / 12;

    let monthlyPayment = 0;
    let totalRepayment = 0;

    if (mortgageType === "repayment") {
      // Fórmula de amortización
      monthlyPayment =
        (amount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      totalRepayment = monthlyPayment * n;
    } else {
      // "Interest Only" mortgage (solo paga intereses mensuales)
      monthlyPayment = amount * r;
      totalRepayment = monthlyPayment * n;
    }

    // Formatear los resultados en euros (€)
    let formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });

    resultsContainer.innerHTML = `
    <h3 class="results__title">Your results</h3>
    <p class="results__desc">Your results are shown below based on the information you provided. To adjust the results, edit the form and click "Calculate repayments" again.</p>
      <div class="results-content">
        <div>
          <p>Your monthly repayments</p>
          <h2>${formatter.format(monthlyPayment)}</h2>
        </div>
        <hr/>
        <div>
          <p>Total you'll repay over the term</p>
          <h3>${formatter.format(totalRepayment)}</h3>
        </div>
      </div>
    `;
  });
});
