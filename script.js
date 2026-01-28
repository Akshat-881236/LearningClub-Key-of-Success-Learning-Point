const pdfjsLib = window["pdfjs-dist/build/pdf"];
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

    // Sort by date (newest first)
    projects.sort((a,b) => new Date(b.date) - new Date(a.date));

    const grid = document.getElementById("projectGrid");
    const searchInput = document.getElementById("searchInput");
    const viewMoreBtn = document.getElementById("viewMoreBtn");
    let visibleCount = 12;

    async function renderProjects(filtered = projects) {
      grid.innerHTML = "";
      const visibleProjects = filtered.slice(0, visibleCount);
      for (const p of visibleProjects) {
        const card = document.createElement("div");
        card.className = "card";
        const imgID = `img-${p.title.replace(/\s+/g, "-")}`;
        card.innerHTML = `
          <img id="${imgID}" alt="${p.title}">
          <div class="card-content">
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
            <div class="tags">#${p.tags.join(" #")}</div>
            <p><a href="${p.link}" target="_blank">Open PDF →</a></p>
          </div>`;
        grid.appendChild(card);

        const cacheKey = `thumb-${p.pdf}`;
        const cached = localStorage.getItem(cacheKey);
        const imgEl = document.getElementById(imgID);
        if (cached) {
          imgEl.src = cached;
          imgEl.style.opacity = "1";
        } else {
          try {
            const pdf = await pdfjsLib.getDocument(p.pdf).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.height = viewport.height / 2;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, viewport }).promise;
            const halfCanvas = document.createElement("canvas");
            halfCanvas.width = canvas.width;
            halfCanvas.height = canvas.height / 2;
            const halfCtx = halfCanvas.getContext("2d");
            halfCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height / 2, 0, 0, halfCanvas.width, halfCanvas.height);
            const imgData = halfCanvas.toDataURL("image/png");
            imgEl.src = imgData;
            imgEl.style.opacity = "1";
            localStorage.setItem(cacheKey, imgData);
          } catch {
            imgEl.src = "Assets/Icons/Icon.png";
            imgEl.style.opacity = "1";
          }
        }
      }
      viewMoreBtn.style.display = filtered.length > visibleCount ? "block" : "none";
    }

    searchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q) ||
        p.link.toLowerCase().includes(q) ||
        p.pdf.toLowerCase().includes(q)
      );
      visibleCount = 12;
      renderProjects(filtered);
    });

    viewMoreBtn.addEventListener("click", () => {
      visibleCount += 12;
      renderProjects();
    });

    renderProjects();
    document.getElementById("year").textContent = new Date().getFullYear();

/* Mobile toggle */
document.querySelector(".nav-toggle")
  .addEventListener("click", () =>
    document.getElementById("anhMainNav").classList.toggle("open")
  );