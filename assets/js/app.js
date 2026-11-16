/**
 * WanderStay - Multi-Step Resort & Tour Booking Engine
 * Core Application Logic: ES6+ Classes/State + jQuery 3.7 DOM & Animations
 * Author: Deb Gourab Biswas
 */

const STORAGE_KEYS = {
  BOOKINGS: "wanderstay_saved_bookings_v1",
  THEME: "wanderstay_theme_v1",
  CURRENCY: "wanderstay_currency_v1"
};

const USD_EXCHANGE_RATE = 84; // 1 USD = 84 INR
const GST_TAX_RATE = 0.12; // 12% Hospitality GST

// ==================== 1. CENTRALIZED ES6 STATE STORE ====================
const BookingState = {
  currentStep: 1,
  currency: "INR",
  theme: "light",
  selectedResortId: "RES-GOA",
  checkIn: "",
  checkOut: "",
  nights: 3,
  adults: 2,
  children: 0,
  rooms: 1,
  selectedTierId: "TIER-DELUXE",
  selectedAddons: ["ADD-TRANSFER"],
  promoCode: null,
  guest: {
    fullName: "",
    email: "",
    phone: "",
    arrivalTime: "Standard Check-In (12:00 PM - 03:00 PM)",
    specialRequests: "",
    paymentMethod: "Instant UPI / Card (Zero Convenience Fee)"
  },
  savedBookings: [],
  lastConfirmedBooking: null
};

// ==================== 2. CURRENCY & DATE UTILITY FUNCTIONS (ES6+) ====================
const formatMoney = (amountInINR) => {
  const num = Number(amountInINR) || 0;
  if (BookingState.currency === "USD") {
    const usdVal = Math.round(num / USD_EXCHANGE_RATE);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(usdVal);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(num));
};

const getDefaultDates = () => {
  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 2);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 3);

  const toISO = (d) => d.toISOString().split("T")[0];
  return {
    minDate: toISO(today),
    checkIn: toISO(checkIn),
    checkOut: toISO(checkOut)
  };
};

const calculateNights = (inDateStr, outDateStr) => {
  if (!inDateStr || !outDateStr) return 0;
  const d1 = new Date(inDateStr);
  const d2 = new Date(outDateStr);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const showToast = (message, variant = "success") => {
  const icons = {
    success: "bi-check-circle-fill text-success",
    info: "bi-info-circle-fill text-primary",
    warning: "bi-exclamation-triangle-fill text-warning",
    danger: "bi-trash3-fill text-danger"
  };
  $("#toastIcon").attr("class", `bi ${icons[variant] || icons.success} fs-5`);
  $("#toastMessage").text(message);
  const toastEl = document.getElementById("liveToast");
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3200 }).show();
};

// ==================== 3. PRICING ENGINE (ES6+) ====================
const calculatePricingBreakdown = () => {
  const resort = WANDERSTAY_RESORTS.find((r) => r.id === BookingState.selectedResortId) || WANDERSTAY_RESORTS[0];
  const tier = WANDERSTAY_ROOM_TIERS.find((t) => t.id === BookingState.selectedTierId) || WANDERSTAY_ROOM_TIERS[0];
  const nights = Math.max(1, BookingState.nights);
  const rooms = Math.max(1, BookingState.rooms);

  // 1. Base room cost (Resort base rate * nights * rooms)
  const baseRoomCostINR = resort.baseRateINR * nights * rooms;

  // 2. Suite Tier Upgrade differential
  const tierTotalINR = Math.round(baseRoomCostINR * tier.multiplier);
  const tierUpgradeDiffINR = tierTotalINR - baseRoomCostINR;

  // 3. Extra adult supplement (more than 2 adults per room)
  const includedAdults = rooms * 2;
  const extraAdults = Math.max(0, BookingState.adults - includedAdults);
  const extraAdultCostINR = extraAdults * 1500 * nights;

  // 4. Tour & Hospitality Add-Ons
  let addonsCostINR = 0;
  BookingState.selectedAddons.forEach((addonId) => {
    const addon = WANDERSTAY_TOUR_ADDONS.find((a) => a.id === addonId);
    if (addon) {
      addonsCostINR += addon.billingType === "perNight" ? addon.priceINR * nights : addon.priceINR;
    }
  });

  const grossSubtotalINR = baseRoomCostINR + tierUpgradeDiffINR + extraAdultCostINR + addonsCostINR;

  // 5. Promo Code Discount
  let discountINR = 0;
  if (BookingState.promoCode && WANDERSTAY_PROMO_CODES[BookingState.promoCode]) {
    const promo = WANDERSTAY_PROMO_CODES[BookingState.promoCode];
    if (grossSubtotalINR >= promo.minSubtotalINR) {
      discountINR =
        promo.type === "percent"
          ? Math.round((grossSubtotalINR * promo.value) / 100)
          : promo.value;
    }
  }

  const netTaxableINR = Math.max(0, grossSubtotalINR - discountINR);
  const taxINR = Math.round(netTaxableINR * GST_TAX_RATE);
  const grandTotalINR = netTaxableINR + taxINR;

  return {
    resort,
    tier,
    nights,
    rooms,
    baseRoomCostINR,
    tierUpgradeDiffINR: tierUpgradeDiffINR + extraAdultCostINR,
    addonsCostINR,
    grossSubtotalINR,
    discountINR,
    taxINR,
    grandTotalINR
  };
};

// ==================== 4. DOM RENDERERS (jQuery + ES6 Template Literals) ====================
const renderResortSelectionCards = () => {
  const $grid = $("#resortSelectionGrid");
  $grid.empty();

  WANDERSTAY_RESORTS.forEach((resort) => {
    const isSelected = resort.id === BookingState.selectedResortId ? "selected" : "";
    $grid.append(`
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card selectable-card h-100 ${isSelected} resort-option-card" data-resort-id="${resort.id}">
          <img src="${resort.image}" class="resort-select-img w-100" alt="${resort.name}" />
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="badge text-bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.68rem;">${resort.category}</span>
              <span class="small fw-bold text-warning"><i class="bi bi-star-fill me-1"></i>${resort.rating}</span>
            </div>
            <h4 class="h6 fw-bold mb-1">${resort.name}</h4>
            <div class="text-body-secondary mb-2" style="font-size: 0.75rem;">
              <i class="bi bi-geo-alt me-1"></i>${resort.location}
            </div>
            <div class="fw-bold text-primary small">
              ${formatMoney(resort.baseRateINR)} <span class="text-body-secondary fw-normal" style="font-size: 0.72rem;">/ night</span>
            </div>
          </div>
        </div>
      </div>
    `);
  });
};

const renderRoomTiersAndAddons = () => {
  const resort = WANDERSTAY_RESORTS.find((r) => r.id === BookingState.selectedResortId) || WANDERSTAY_RESORTS[0];
  const $tierGrid = $("#roomTierGrid");
  $tierGrid.empty();

  WANDERSTAY_ROOM_TIERS.forEach((tier) => {
    const isSelected = tier.id === BookingState.selectedTierId ? "selected" : "";
    const nightlyRate = Math.round(resort.baseRateINR * tier.multiplier);
    $tierGrid.append(`
      <div class="col-12 col-md-4">
        <div class="card selectable-card h-100 ${isSelected} room-tier-card" data-tier-id="${tier.id}">
          <div class="card-body p-3 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h4 class="h6 fw-bold mb-0">${tier.name}</h4>
              <i class="bi ${isSelected ? "bi-check-circle-fill text-primary" : "bi-circle text-body-secondary"} fs-5"></i>
            </div>
            <div class="small text-body-secondary mb-2">
              <i class="bi bi-arrows-fullscreen me-1"></i>${tier.sqft} &middot; ${tier.bed}
            </div>
            <p class="small text-body-secondary flex-grow-1 mb-3" style="font-size: 0.76rem;">${tier.perks}</p>
            <div class="pt-2 border-top d-flex justify-content-between align-items-center">
              <span class="small text-body-secondary">Nightly Rate</span>
              <span class="fw-bold text-primary">${formatMoney(nightlyRate)}</span>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  const $addonsGrid = $("#tourAddonsGrid");
  $addonsGrid.empty();

  WANDERSTAY_TOUR_ADDONS.forEach((addon) => {
    const isChecked = BookingState.selectedAddons.includes(addon.id);
    const activeClass = isChecked ? "selected" : "";
    const priceSuffix = addon.billingType === "perNight" ? "/ night" : "one-time";

    $addonsGrid.append(`
      <div class="col-12 col-md-6">
        <div class="card selectable-card h-100 ${activeClass} addon-toggle-card" data-addon-id="${addon.id}">
          <div class="card-body p-3 d-flex align-items-start gap-3">
            <div class="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center">
              <i class="bi ${addon.icon} fs-5"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="small fw-bold mb-1">${addon.name}</h5>
                <input class="form-check-input mt-0 pointer-none" type="checkbox" ${isChecked ? "checked" : ""} tabindex="-1" />
              </div>
              <p class="text-body-secondary mb-1" style="font-size: 0.75rem;">${addon.desc}</p>
              <span class="fw-bold text-primary small">+${formatMoney(addon.priceINR)} <span class="text-body-secondary fw-normal" style="font-size: 0.7rem;">(${priceSuffix})</span></span>
            </div>
          </div>
        </div>
      </div>
    `);
  });
};

const updateStickyPriceSummary = () => {
  const breakdown = calculatePricingBreakdown();

  $("#summaryResortImg").attr("src", breakdown.resort.image);
  $("#summaryLocationBadge").html(`<i class="bi bi-geo-alt-fill text-warning me-1"></i>${breakdown.resort.location}`);
  $("#summaryRatingBadge").html(`<i class="bi bi-star-fill text-warning me-1"></i>${breakdown.resort.rating}`);
  $("#summaryResortName").text(breakdown.resort.name);
  $("#summaryRoomTierName").text(
    `${breakdown.tier.name} · ${breakdown.rooms} ${breakdown.rooms > 1 ? "Rooms" : "Room"}`
  );

  $("#summaryDatesText").text(`${breakdown.nights} ${breakdown.nights === 1 ? "Night" : "Nights"} (${BookingState.checkIn} to ${BookingState.checkOut})`);
  $("#summaryGuestsText").text(`${BookingState.adults} Adults, ${BookingState.children} Children`);

  $("#summaryBaseCalcLabel").text(`Base Stay (${breakdown.nights}N × ${breakdown.rooms}R)`);
  $("#summaryBaseAmount").text(formatMoney(breakdown.baseRoomCostINR));

  $("#summaryTierUpgradeLabel").text(`Suite Upgrade & Extra Guests`);
  $("#summaryTierAmount").text(`+${formatMoney(breakdown.tierUpgradeDiffINR)}`);

  $("#summaryAddonsLabel").text(`Curated Add-Ons (${BookingState.selectedAddons.length})`);
  $("#summaryAddonsAmount").text(`+${formatMoney(breakdown.addonsCostINR)}`);

  if (breakdown.discountINR > 0 && BookingState.promoCode) {
    $("#summaryPromoCodeTag").text(BookingState.promoCode);
    $("#summaryDiscountAmount").text(`-${formatMoney(breakdown.discountINR)}`);
    $("#summaryDiscountRow").attr("style", "display: flex !important;");
  } else {
    $("#summaryDiscountRow").attr("style", "display: none !important;");
  }

  $("#summaryTaxAmount").text(formatMoney(breakdown.taxINR));
  $("#summaryGrandTotal").text(formatMoney(breakdown.grandTotalINR));

  // If currently on Step 4, keep the Step 4 review card in sync
  if (BookingState.currentStep === 4) {
    renderStep4ReviewSummary(breakdown);
  }
};

const renderStep4ReviewSummary = (breakdown) => {
  const addonNames = BookingState.selectedAddons
    .map((id) => WANDERSTAY_TOUR_ADDONS.find((a) => a.id === id)?.name)
    .filter(Boolean);

  $("#step4ReviewCard").html(`
    <div class="row g-3 small">
      <div class="col-12 col-sm-6">
        <div class="text-body-secondary">Selected Resort</div>
        <div class="fw-bold">${breakdown.resort.name} (${breakdown.resort.location})</div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-body-secondary">Suite &amp; Occupancy</div>
        <div class="fw-bold">${breakdown.tier.name} &times; ${breakdown.rooms} (${BookingState.adults} Adults, ${BookingState.children} Children)</div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-body-secondary">Check-In &rarr; Check-Out</div>
        <div class="fw-bold">${BookingState.checkIn} to ${BookingState.checkOut} (${breakdown.nights} Nights)</div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="text-body-secondary">Primary Guest</div>
        <div class="fw-bold">${BookingState.guest.fullName || "Not entered"} &middot; ${BookingState.guest.phone || ""}</div>
      </div>
      <div class="col-12 border-top pt-2">
        <div class="text-body-secondary">Included Tour &amp; Hospitality Add-Ons</div>
        <div class="fw-medium">${addonNames.length > 0 ? addonNames.join(" • ") : "No optional add-ons selected"}</div>
      </div>
    </div>
  `);
};

// ==================== 5. WIZARD STEP NAVIGATION & VALIDATION ====================
const STEP_TITLES = {
  1: "Step 1 of 4: Destination & Dates",
  2: "Step 2 of 4: Suite Upgrade & Curated Tours",
  3: "Step 3 of 4: Primary Guest Contact Details",
  4: "Step 4 of 4: Review Summary & Promo Code"
};

const NEXT_BTN_LABELS = {
  1: "Continue to Rooms & Tours",
  2: "Continue to Guest Details",
  3: "Review Itinerary & Promo"
};

const validateCurrentStep = () => {
  $("#wizardErrorAlert").slideUp(150);

  if (BookingState.currentStep === 1) {
    const checkIn = $("#checkInDate").val();
    const checkOut = $("#checkOutDate").val();
    const nights = calculateNights(checkIn, checkOut);

    if (!checkIn || !checkOut || nights < 1) {
      $("#wizardErrorText").text("Check-Out date must be at least 1 night after your Check-In date.");
      $("#wizardErrorAlert").slideDown(180);
      return false;
    }
    BookingState.checkIn = checkIn;
    BookingState.checkOut = checkOut;
    BookingState.nights = nights;
    return true;
  }

  if (BookingState.currentStep === 2) {
    if (!BookingState.selectedTierId) {
      $("#wizardErrorText").text("Please select a Room Suite Tier to continue.");
      $("#wizardErrorAlert").slideDown(180);
      return false;
    }
    return true;
  }

  if (BookingState.currentStep === 3) {
    const fullName = $("#guestFullName").val().trim();
    const email = $("#guestEmail").val().trim();
    const phone = $("#guestPhone").val().trim();
    const agreed = $("#termsAgreeCheck").is(":checked");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = phone.replace(/\D/g, "");

    if (fullName.length < 3) {
      $("#wizardErrorText").text("Please enter the primary guest's full name (minimum 3 characters).");
      $("#wizardErrorAlert").slideDown(180);
      $("#guestFullName").trigger("focus");
      return false;
    }
    if (!emailRegex.test(email)) {
      $("#wizardErrorText").text("Please enter a valid email address for e-ticket delivery.");
      $("#wizardErrorAlert").slideDown(180);
      $("#guestEmail").trigger("focus");
      return false;
    }
    if (phoneDigits.length < 10) {
      $("#wizardErrorText").text("Please enter a valid 10-digit mobile or WhatsApp number.");
      $("#wizardErrorAlert").slideDown(180);
      $("#guestPhone").trigger("focus");
      return false;
    }
    if (!agreed) {
      $("#wizardErrorText").text("Please accept the resort check-in and 48-hour cancellation policy.");
      $("#wizardErrorAlert").slideDown(180);
      return false;
    }

    BookingState.guest.fullName = fullName;
    BookingState.guest.email = email;
    BookingState.guest.phone = phone;
    BookingState.guest.arrivalTime = $("#guestArrivalTime").val();
    BookingState.guest.specialRequests = $("#guestSpecialRequests").val().trim();
    return true;
  }

  return true;
};

const goToWizardStep = (targetStep) => {
  BookingState.currentStep = targetStep;

  const pct = targetStep * 25;
  $("#wizardStepCounterText").text(STEP_TITLES[targetStep]);
  $("#wizardProgressBadge").text(`${pct}% Complete`);
  $("#wizardProgressBar").css("width", `${pct}%`);

  // Update Step Pills
  $("#wizardStepPills .step-pill").each(function () {
    const stepNum = Number($(this).data("step"));
    $(this).removeClass("active completed");
    if (stepNum === targetStep) {
      $(this).addClass("active");
    } else if (stepNum < targetStep) {
      $(this).addClass("completed");
    }
  });

  // Animate panes with jQuery fadeOut / fadeIn
  $(".wizard-step-pane").hide();
  $(`#stepPane${targetStep}`).fadeIn(220);

  // Update Footer Buttons
  $("#wizardPrevBtn").prop("disabled", targetStep === 1);

  if (targetStep < 4) {
    $("#wizardSubmitBtn").hide();
    $("#wizardNextBtn")
      .show()
      .html(`<span>${NEXT_BTN_LABELS[targetStep]}</span><i class="bi bi-arrow-right ms-1"></i>`);
  } else {
    $("#wizardNextBtn").hide();
    $("#wizardSubmitBtn").show();
    updateStickyPriceSummary();
  }
};

// ==================== 6. GALLERY & LIGHTBOX CONTROLLER ====================
const renderDestinationGallery = (category = "ALL") => {
  const $grid = $("#destinationGalleryGrid");
  $grid.empty();

  const filtered =
    category === "ALL"
      ? WANDERSTAY_RESORTS
      : WANDERSTAY_RESORTS.filter((r) => r.category === category);

  filtered.forEach((resort) => {
    const amenitiesBadges = resort.amenities
      .map((a) => `<span class="badge text-bg-secondary-subtle text-body-secondary border me-1 mb-1">${a}</span>`)
      .join("");

    $grid.append(`
      <div class="col-12 col-md-6 col-lg-4 gallery-item-col">
        <div class="card gallery-card h-100 border shadow-xs">
          <div class="gallery-img-wrapper">
            <img src="${resort.image}" alt="${resort.name}" />
            <span class="badge text-bg-dark bg-opacity-75 position-absolute top-0 start-0 m-3 rounded-pill px-3 py-1">
              ${resort.category}
            </span>
            <button type="button" class="btn btn-light btn-sm rounded-circle position-absolute bottom-0 end-0 m-3 shadow btn-open-lightbox" data-resort-id="${resort.id}" title="Quick Lightbox View">
              <i class="bi bi-arrows-angle-expand"></i>
            </button>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-body-secondary"><i class="bi bi-geo-alt-fill text-primary me-1"></i>${resort.location}</small>
              <span class="badge text-bg-warning-subtle text-warning-emphasis"><i class="bi bi-star-fill text-warning me-1"></i>${resort.rating}</span>
            </div>
            <h3 class="h6 fw-bold mb-2">${resort.name}</h3>
            <p class="text-body-secondary small mb-3 flex-grow-1">${resort.tagline}</p>
            <div class="mb-3">${amenitiesBadges}</div>
            <div class="pt-3 border-top d-flex justify-content-between align-items-center">
              <div>
                <span class="text-body-secondary d-block" style="font-size: 0.7rem;">Starts from</span>
                <span class="fw-bold text-primary">${formatMoney(resort.baseRateINR)} <small class="text-body-secondary fw-normal">/ night</small></span>
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 btn-book-from-gallery" data-resort-id="${resort.id}">
                Book Resort <i class="bi bi-arrow-up-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  });
};

// ==================== 7. LOCALSTORAGE BOOKINGS MANAGER ====================
const loadSavedState = () => {
  try {
    const rawBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    BookingState.savedBookings = rawBookings ? JSON.parse(rawBookings) : [];

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === "dark" || savedTheme === "light") {
      BookingState.theme = savedTheme;
    }

    const savedCurr = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (savedCurr === "INR" || savedCurr === "USD") {
      BookingState.currency = savedCurr;
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    BookingState.savedBookings = [];
  }
};

const saveBookingsToStorage = () => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(BookingState.savedBookings));
  $("#navBookingsCount").text(BookingState.savedBookings.length);
};

const renderSavedBookingsModal = () => {
  const $container = $("#savedBookingsListContainer");
  $container.empty();
  $("#navBookingsCount").text(BookingState.savedBookings.length);

  if (BookingState.savedBookings.length === 0) {
    $container.html(`
      <div class="text-center py-5">
        <i class="bi bi-calendar2-x fs-1 text-body-secondary mb-2 d-block"></i>
        <h6 class="fw-bold">No Reservations Yet</h6>
        <p class="text-body-secondary small mb-0">Complete the 4-step booking wizard to generate your first resort e-ticket.</p>
      </div>
    `);
    return;
  }

  BookingState.savedBookings.forEach((b) => {
    $container.append(`
      <div class="card border rounded-3 mb-3 shadow-xs">
        <div class="card-body p-3">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-2 mb-2">
            <div>
              <span class="badge text-bg-success me-2">${b.bookingRef}</span>
              <strong class="small">${b.resortName}</strong>
              <span class="text-body-secondary small">(${b.location})</span>
            </div>
            <span class="fw-bold text-primary font-monospace">${formatMoney(b.grandTotalINR)}</span>
          </div>
          <div class="row g-2 small text-body-secondary">
            <div class="col-12 col-sm-6">
              <i class="bi bi-calendar-check me-1"></i><strong>Dates:</strong> ${b.checkIn} &rarr; ${b.checkOut} (${b.nights}N)
            </div>
            <div class="col-12 col-sm-6">
              <i class="bi bi-house-door me-1"></i><strong>Suite:</strong> ${b.tierName} &times; ${b.rooms}
            </div>
            <div class="col-12 col-sm-6">
              <i class="bi bi-person me-1"></i><strong>Guest:</strong> ${b.guestName} (${b.guestPhone})
            </div>
            <div class="col-12 col-sm-6 text-sm-end">
              <button type="button" class="btn btn-outline-danger btn-xs rounded-pill px-3 btn-cancel-booking" data-ref="${b.bookingRef}">
                <i class="bi bi-x-circle me-1"></i>Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  });
};

// ==================== 8. jQuery DOCUMENT READY & EVENT BINDINGS ====================
$(document).ready(function () {
  loadSavedState();

  // Initialize Default Check-In / Check-Out Dates
  const defaults = getDefaultDates();
  $("#checkInDate").attr("min", defaults.minDate).val(defaults.checkIn);
  $("#checkOutDate").attr("min", defaults.checkIn).val(defaults.checkOut);
  BookingState.checkIn = defaults.checkIn;
  BookingState.checkOut = defaults.checkOut;
  BookingState.nights = calculateNights(defaults.checkIn, defaults.checkOut);

  // Apply Theme & Currency UI
  $("html").attr("data-bs-theme", BookingState.theme);
  $("#themeIcon").attr("class", BookingState.theme === "dark" ? "bi bi-sun-fill text-warning" : "bi bi-moon-stars-fill");
  $(`input[name="currencyToggle"][value="${BookingState.currency}"]`).prop("checked", true);

  // Initial Renders
  renderResortSelectionCards();
  renderRoomTiersAndAddons();
  updateStickyPriceSummary();
  renderDestinationGallery("ALL");
  renderSavedBookingsModal();

  // 1. Theme Switcher
  $("#themeToggleBtn").on("click", function () {
    BookingState.theme = BookingState.theme === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEYS.THEME, BookingState.theme);
    $("html").attr("data-bs-theme", BookingState.theme);
    $("#themeIcon").attr(
      "class",
      BookingState.theme === "dark" ? "bi bi-sun-fill text-warning" : "bi bi-moon-stars-fill"
    );
    showToast(`Switched to ${BookingState.theme.toUpperCase()} mode`, "info");
  });

  // 2. Currency Toggle (INR / USD)
  $('input[name="currencyToggle"]').on("change", function () {
    BookingState.currency = $(this).val();
    localStorage.setItem(STORAGE_KEYS.CURRENCY, BookingState.currency);
    renderResortSelectionCards();
    renderRoomTiersAndAddons();
    updateStickyPriceSummary();
    const activeCat = $("#galleryFilterTabs .gallery-filter-btn.active").data("category") || "ALL";
    renderDestinationGallery(activeCat);
    renderSavedBookingsModal();
    showToast(`Currency updated to ${BookingState.currency}`, "info");
  });

  // 3. Select Resort Card in Step 1 (Event Delegation)
  $(document).on("click", ".resort-option-card", function () {
    const resortId = $(this).data("resort-id");
    BookingState.selectedResortId = resortId;
    $(".resort-option-card").removeClass("selected");
    $(this).addClass("selected");
    renderRoomTiersAndAddons();
    updateStickyPriceSummary();
  });

  // 4. Date & Guest Count Changes in Step 1
  $("#checkInDate, #checkOutDate").on("change", function () {
    const inVal = $("#checkInDate").val();
    const outVal = $("#checkOutDate").val();
    const nights = calculateNights(inVal, outVal);

    if (nights > 0) {
      BookingState.checkIn = inVal;
      BookingState.checkOut = outVal;
      BookingState.nights = nights;
      $("#wizardErrorAlert").slideUp(150);
      updateStickyPriceSummary();
    } else {
      $("#wizardErrorText").text("Check-Out date must be after Check-In date.");
      $("#wizardErrorAlert").slideDown(180);
    }
  });

  $("#adultsCount, #childrenCount, #roomsCount").on("change", function () {
    BookingState.adults = Number($("#adultsCount").val());
    BookingState.children = Number($("#childrenCount").val());
    BookingState.rooms = Number($("#roomsCount").val());
    updateStickyPriceSummary();
  });

  // 5. Select Room Suite Tier in Step 2
  $(document).on("click", ".room-tier-card", function () {
    BookingState.selectedTierId = $(this).data("tier-id");
    renderRoomTiersAndAddons();
    updateStickyPriceSummary();
  });

  // 6. Toggle Tour Add-On Cards in Step 2
  $(document).on("click", ".addon-toggle-card", function () {
    const addonId = $(this).data("addon-id");
    const idx = BookingState.selectedAddons.indexOf(addonId);
    if (idx > -1) {
      BookingState.selectedAddons.splice(idx, 1);
    } else {
      BookingState.selectedAddons.push(addonId);
    }
    renderRoomTiersAndAddons();
    updateStickyPriceSummary();
  });

  // 7. Wizard Next / Previous / Step Pill Navigation
  $("#wizardNextBtn").on("click", function () {
    if (validateCurrentStep() && BookingState.currentStep < 4) {
      goToWizardStep(BookingState.currentStep + 1);
    }
  });

  $("#wizardPrevBtn").on("click", function () {
    if (BookingState.currentStep > 1) {
      $("#wizardErrorAlert").slideUp(150);
      goToWizardStep(BookingState.currentStep - 1);
    }
  });

  $("#wizardStepPills .step-pill").on("click", function () {
    const target = Number($(this).data("step"));
    if (target < BookingState.currentStep) {
      goToWizardStep(target);
    } else if (target === BookingState.currentStep + 1 && validateCurrentStep()) {
      goToWizardStep(target);
    }
  });

  // 8. Promo Code Engine in Step 4
  const applyPromoCode = (rawCode) => {
    const code = String(rawCode || "").trim().toUpperCase();
    const $feedback = $("#promoFeedbackMsg");

    if (!code || !WANDERSTAY_PROMO_CODES[code]) {
      $feedback
        .attr("class", "small mt-2 fw-medium text-danger")
        .html('<i class="bi bi-x-circle-fill me-1"></i>Invalid coupon code. Try WANDER20, FIRST50, or FESTIVE15.')
        .slideDown(150);
      return;
    }

    const promo = WANDERSTAY_PROMO_CODES[code];
    const currentBreakdown = calculatePricingBreakdown();

    if (currentBreakdown.grossSubtotalINR < promo.minSubtotalINR) {
      $feedback
        .attr("class", "small mt-2 fw-medium text-warning-emphasis")
        .html(`<i class="bi bi-exclamation-circle-fill me-1"></i>Minimum subtotal of ${formatMoney(promo.minSubtotalINR)} required for ${code}.`)
        .slideDown(150);
      return;
    }

    BookingState.promoCode = code;
    $("#promoCodeInput").val(code);
    $("#removePromoBtn").show();
    updateStickyPriceSummary();

    const updatedBreakdown = calculatePricingBreakdown();
    $feedback
      .attr("class", "small mt-2 fw-medium text-success")
      .html(`<i class="bi bi-check-circle-fill me-1"></i>Coupon <strong>${code}</strong> applied! You saved ${formatMoney(updatedBreakdown.discountINR)}.`)
      .slideDown(150);
    showToast(`Promo code ${code} applied!`, "success");
  };

  $("#applyPromoBtn").on("click", function () {
    applyPromoCode($("#promoCodeInput").val());
  });

  $(".quick-promo-chip").on("click", function () {
    applyPromoCode($(this).data("code"));
  });

  $("#removePromoBtn").on("click", function () {
    BookingState.promoCode = null;
    $("#promoCodeInput").val("");
    $(this).hide();
    $("#promoFeedbackMsg").slideUp(150);
    updateStickyPriceSummary();
    showToast("Promo code removed", "info");
  });

  // 9. Final Booking Form Submission -> Generate E-Ticket & Save to localStorage
  $("#bookingWizardForm").on("submit", function (e) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const breakdown = calculatePricingBreakdown();
    const bookingRef = "WS-" + Math.floor(100000 + Math.random() * 900000);
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();

    const newBooking = {
      bookingRef,
      createdAt: new Date().toISOString().split("T")[0],
      resortId: breakdown.resort.id,
      resortName: breakdown.resort.name,
      location: breakdown.resort.location,
      tierName: breakdown.tier.name,
      checkIn: BookingState.checkIn,
      checkOut: BookingState.checkOut,
      nights: breakdown.nights,
      rooms: breakdown.rooms,
      adults: BookingState.adults,
      children: BookingState.children,
      addonsCount: BookingState.selectedAddons.length,
      promoCode: BookingState.promoCode || "NONE",
      grandTotalINR: breakdown.grandTotalINR,
      guestName: BookingState.guest.fullName,
      guestEmail: BookingState.guest.email,
      guestPhone: BookingState.guest.phone,
      arrivalTime: BookingState.guest.arrivalTime,
      paymentMethod
    };

    BookingState.lastConfirmedBooking = newBooking;
    BookingState.savedBookings.unshift(newBooking);
    saveBookingsToStorage();
    renderSavedBookingsModal();

    $("#confirmationVoucherBody").html(`
      <div class="text-center mb-3">
        <span class="badge rounded-pill text-bg-success-subtle text-success border border-success-subtle px-3 py-2 mb-2">
          Booking Reference: <strong>${newBooking.bookingRef}</strong>
        </span>
        <h4 class="h5 fw-bold mb-0">${newBooking.resortName}</h4>
        <small class="text-body-secondary">${newBooking.location}</small>
      </div>
      <div class="p-3 rounded-3 bg-body-tertiary border small mb-3">
        <div class="d-flex justify-content-between py-1 border-bottom">
          <span class="text-body-secondary">Guest Name</span>
          <span class="fw-semibold">${newBooking.guestName}</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom">
          <span class="text-body-secondary">Check-In / Check-Out</span>
          <span class="fw-semibold">${newBooking.checkIn} &rarr; ${newBooking.checkOut} (${newBooking.nights} Nights)</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom">
          <span class="text-body-secondary">Suite &amp; Guests</span>
          <span class="fw-semibold">${newBooking.tierName} &times; ${newBooking.rooms} (${newBooking.adults}A, ${newBooking.children}C)</span>
        </div>
        <div class="d-flex justify-content-between py-1 border-bottom">
          <span class="text-body-secondary">Payment Mode</span>
          <span class="fw-semibold">${newBooking.paymentMethod}</span>
        </div>
        <div class="d-flex justify-content-between pt-2 mt-1">
          <span class="fw-bold">Total Confirmed Fare</span>
          <span class="fw-bold text-primary fs-6 font-monospace">${formatMoney(newBooking.grandTotalINR)}</span>
        </div>
      </div>
      <p class="text-body-secondary small mb-0 text-center">
        A copy of this reservation has been saved to <strong>My Bookings</strong> in your browser.
      </p>
    `);

    const confModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("confirmationModal"));
    confModal.show();
    showToast(`Booking ${bookingRef} confirmed!`, "success");
  });

  // Download Printable E-Ticket (.txt)
  $("#downloadVoucherTxtBtn").on("click", function () {
    const b = BookingState.lastConfirmedBooking;
    if (!b) return;

    const receiptLines = [
      "============================================================",
      "         WANDERSTAY LUXURY RESORTS & TOURS E-TICKET         ",
      "============================================================",
      `Booking Reference : ${b.bookingRef}`,
      `Confirmation Date : ${b.createdAt}`,
      `Resort Property   : ${b.resortName} (${b.location})`,
      `Suite Category    : ${b.tierName} (x${b.rooms} Room/s)`,
      `Check-In Date     : ${b.checkIn} (${b.arrivalTime})`,
      `Check-Out Date    : ${b.checkOut} (${b.nights} Nights)`,
      `Registered Guest  : ${b.guestName} | ${b.guestPhone} | ${b.guestEmail}`,
      `Promo Code Used   : ${b.promoCode}`,
      `Payment Method    : ${b.paymentMethod}`,
      "------------------------------------------------------------",
      `TOTAL AMOUNT      : ${formatMoney(b.grandTotalINR)} (Inclusive of 12% GST)`,
      "============================================================",
      "Thank you for booking with WanderStay!"
    ];

    const blob = new Blob([receiptLines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WanderStay_ETicket_${b.bookingRef}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  $("#startNewBookingBtn").on("click", function () {
    goToWizardStep(1);
  });

  // 10. Cancel / Delete Saved Bookings
  $(document).on("click", ".btn-cancel-booking", function () {
    const ref = $(this).data("ref");
    BookingState.savedBookings = BookingState.savedBookings.filter((b) => b.bookingRef !== ref);
    saveBookingsToStorage();
    renderSavedBookingsModal();
    showToast(`Cancelled reservation ${ref}`, "danger");
  });

  $("#clearAllBookingsBtn").on("click", function () {
    if (BookingState.savedBookings.length === 0) return;
    if (confirm("Clear all saved booking history from your browser?")) {
      BookingState.savedBookings = [];
      saveBookingsToStorage();
      renderSavedBookingsModal();
      showToast("Cleared all saved bookings", "danger");
    }
  });

  // 11. Interactive Gallery Filtering & Lightbox Modal
  $("#galleryFilterTabs .gallery-filter-btn").on("click", function () {
    $("#galleryFilterTabs .gallery-filter-btn")
      .removeClass("active btn-primary")
      .addClass("btn-outline-secondary");
    $(this).removeClass("btn-outline-secondary").addClass("active btn-primary");

    const cat = $(this).data("category");
    $("#destinationGalleryGrid").fadeOut(140, function () {
      renderDestinationGallery(cat);
      $("#destinationGalleryGrid").fadeIn(180);
    });
  });

  let currentLightboxResortId = null;

  $(document).on("click", ".btn-open-lightbox", function () {
    const resortId = $(this).data("resort-id");
    const resort = WANDERSTAY_RESORTS.find((r) => r.id === resortId);
    if (!resort) return;

    currentLightboxResortId = resort.id;
    $("#lightboxModalTitle").text(resort.name);
    $("#lightboxModalLocation").html(`<i class="bi bi-geo-alt-fill text-primary me-1"></i>${resort.location} &middot; ★ ${resort.rating}`);
    $("#lightboxModalImg").attr("src", resort.image);
    $("#lightboxModalDesc").text(resort.tagline);
    $("#lightboxModalPrice").html(`${formatMoney(resort.baseRateINR)} <small class="text-body-secondary fw-normal fs-6">/ night</small>`);
    $("#lightboxModalBadges").html(
      resort.amenities
        .map((a) => `<span class="badge text-bg-primary-subtle text-primary border border-primary-subtle me-1">${a}</span>`)
        .join("")
    );

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("lightboxModal"));
    modal.show();
  });

  $("#lightboxSelectResortBtn").on("click", function () {
    if (currentLightboxResortId) {
      BookingState.selectedResortId = currentLightboxResortId;
      renderResortSelectionCards();
      renderRoomTiersAndAddons();
      updateStickyPriceSummary();
      bootstrap.Modal.getInstance(document.getElementById("lightboxModal")).hide();
      goToWizardStep(1);
      $("html, body").animate({ scrollTop: $("#bookingWizardSection").offset().top - 70 }, 400);
      showToast("Selected resort in booking wizard!", "success");
    }
  });

  $(document).on("click", ".btn-book-from-gallery", function () {
    const resortId = $(this).data("resort-id");
    BookingState.selectedResortId = resortId;
    renderResortSelectionCards();
    renderRoomTiersAndAddons();
    updateStickyPriceSummary();
    goToWizardStep(1);
    $("html, body").animate({ scrollTop: $("#bookingWizardSection").offset().top - 70 }, 400);
    showToast("Selected resort in booking wizard!", "success");
  });
});
