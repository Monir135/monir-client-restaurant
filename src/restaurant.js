
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservationForm');
  const whatsappBtn = document.querySelector('.btn-gold[href^="https://wa.me"]');
  const confirmationBox = document.getElementById('confirmationBox');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (!form) return;

  let latestBooking = {}; // Store latest booking details

  function generateRef() {
    return 'NRG-' + Math.floor(100000 + Math.random() * 900000);
  }

  let qrCode = new QRCodeStyling({
    width: 150,
    height: 150,
    type: "svg",
    data: "",
    dotsOptions: { color: "#0b0b0f" },
    backgroundOptions: { color: "#f9c74f" }
  });

  // WhatsApp click: always uses latestBooking
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      if (!latestBooking.name) return; // no booking yet
      const newRef = generateRef();
      document.getElementById('bookingRef').value = newRef;

      const message = `
🍽️ *Noiré Gourmet – Table Booking*

📌 Booking Ref: ${newRef}
👤 Name: ${latestBooking.name}
📞 Phone: ${latestBooking.phone}
👥 Guests: ${latestBooking.guests}
📅 Date: ${latestBooking.date}
⏰ Time: ${latestBooking.time}

Please confirm my reservation.
`;

      whatsappBtn.href = `https://wa.me/918822030323?text=${encodeURIComponent(message)}`;
      whatsappBtn.target = "_blank";
    });
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookingRef = generateRef();
    document.getElementById('bookingRef').value = bookingRef;
    const formData = new FormData(form);

    form.style.display = 'none';
    confirmationBox.style.display = 'block';
    confirmationBox.innerHTML = `<h3>Confirming booking…</h3>`;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (!result.success) throw new Error('Web3Forms error');

      // Store latest booking details
      latestBooking = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        guests: formData.get('guests'),
        date: formData.get('date'),
        time: formData.get('time')
      };

      showConfirmation(formData, bookingRef);

    } catch (error) {
      confirmationBox.innerHTML = `
        <p style="color:#ff6b6b">❌ Booking failed. Please try again.</p>
        <button class="btn-gold" onclick="goBack()">Go Back</button>
      `;
    }
  });

  window.showConfirmation = function(formData, ref) {
    const { name, phone, guests, date, time } = latestBooking;

    const qrText = `Booking Ref: ${ref}\nName: ${name}\nPhone: ${phone}\nGuests: ${guests}\nDate: ${date} ${time}`;
    qrCode.update({ data: qrText });

    confirmationBox.innerHTML = `
      <h2>Booking Confirmed 🎉</h2>
      <div class="confirmation-details">
        <div><span>Reference</span><strong>${ref}</strong></div>
        <div><span>Name</span><strong>${name}</strong></div>
        <div><span>Phone</span><strong>${phone}</strong></div>
        <div><span>Guests</span><strong>${guests}</strong></div>
        <div><span>Date</span><strong>${date}</strong></div>
        <div><span>Time</span><strong>${time}</strong></div>
      </div>
      <div class="qr-wrapper">
        <div id="qrCodeContainer"></div>
        <p class="qr-hint">Show this QR code at the entrance</p>
      </div>
      <div class="confirmation-buttons">
        <button class="btn-primary"
          onclick="downloadReceipt('${ref}', '${name}', '${phone}', '${guests}', '${date}', '${time}')">
          Download Receipt
        </button>
        <button class="btn-gold" onclick="goBack()">Go Back</button>
      </div>
    `;

    qrCode.append(document.getElementById('qrCodeContainer'));
  };

  window.goBack = function() {
    confirmationBox.style.display = 'none';
    form.reset();
    form.style.display = 'block';
    latestBooking = {}; // clear booking info
  };

  window.downloadReceipt = async function(ref, name, phone, guests, date, time) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Noiré Gourmet", 20, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Luxury Dining — Booking Receipt", 20, 33);
    doc.line(20, 38, 190, 38);

    let y = 50;
    const row = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 80, y);
      y += 10;
    };
    row("Booking Reference:", ref);
    row("Name:", name);
    row("Phone:", phone);
    row("Guests:", guests);
    row("Date:", date);
    row("Time:", time);

    try {
      const blob = await qrCode.getRawData("png");
      const reader = new FileReader();
      reader.onload = () => {
        doc.text("Scan QR at entrance", 140, 55);
        doc.addImage(reader.result, "PNG", 140, 60, 40, 40);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("Please present this receipt or QR code upon arrival.", 20, 140);
        doc.text("Thank you for choosing Noiré Gourmet.", 20, 147);
        doc.save(`Noire-Gourmet-${ref}.pdf`);
      };
      reader.readAsDataURL(blob);
    } catch {
      alert("Failed to generate QR code for receipt.");
    }
  };

  /* HERO SLIDER */
  const heroImages = ['images/restaurant9.jpg','images/restaurant6.jpg','images/restaurant8.jpg'];
  let currentHero = 0;
  const heroEl = document.querySelector('.hero-image');

  function changeHeroImage() {
    heroEl.style.opacity = 0;
    setTimeout(() => {
      currentHero = (currentHero + 1) % heroImages.length;
      heroEl.style.backgroundImage = `url(${heroImages[currentHero]})`;
      heroEl.style.opacity = 1;
    }, 800);
  }

  if (heroEl) {
    heroEl.style.backgroundImage = `url(${heroImages[0]})`;
    setInterval(changeHeroImage, 6000);
  }

  /* MENU FILTER */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      menuCards.forEach(card => {
        card.style.display = filter === 'all' || card.classList.contains(filter) ? '' : 'none';
      });
    });
  });
});
