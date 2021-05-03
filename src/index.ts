import { execSync } from "child_process";

const impfstoffe = [
  {
    qualification: "L920",
    name: "Comirnaty (BioNTech)",
    tssname: "BioNTech",
    interval: 40,
    age: "16-17",
  },
  {
    qualification: "L921",
    name: "mRNA-1273 (Moderna)",
    tssname: "Moderna, BioNTech",
    interval: 40,
    age: "18-59",
  },
  {
    qualification: "L922",
    name: "COVID-1912 (AstraZeneca)",
    tssname: "Moderna, BioNTech, AstraZeneca",
    interval: 40,
    age: "60+",
  },
  {
    qualification: "L923",
    name: "COVID-19 Vaccine Janssen (Johnson & Johnson)",
    tssname: "Johnson&Johnson",
    age: "18+",
  },
];

const impfstoffNamen = {
  L920: "BioNTech",
  L921: "Moderna",
  L922: "AstraZeneca",
  L923: "Johnson&Johnson",
};

interface Impfzentrum {
  Zentrumsname: string;
  PLZ: string;
  Ort: string;
  Bundesland: string;
  URL: string;
  Adresse: string;
}

const impfzentrenBrandenburg: Impfzentrum[] = [
  {
    Zentrumsname: "Impfzentrum Cottbus",
    PLZ: "03042",
    Ort: "Cottbus",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Vorparkstraße 3",
  },
  {
    Zentrumsname: "Impfzentrum Elsterwerda",
    PLZ: "04910",
    Ort: "Elsterwerda",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Am Elsterschloß 4",
  },
  {
    Zentrumsname: "Impfzentrum Schönefeld",
    PLZ: "12529",
    Ort: "Schönefeld",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Flughafen Schönefeld, Terminal 5 ",
  },
  {
    Zentrumsname: "Impfzentrum Potsdam",
    PLZ: "14482",
    Ort: "Potsdam",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Großbeerenstraße 200",
  },
  {
    Zentrumsname: "Impfzentrum Falkensee",
    PLZ: "14612",
    Ort: "Falkensee",
    Bundesland: "Brandenburg",
    URL: "https://357-iz.impfterminservice.de/",
    Adresse: "Scharenbergstraße 15",
  },
  {
    Zentrumsname: "Impfzentrum Rathenow",
    PLZ: "14712",
    Ort: "Rathenow",
    Bundesland: "Brandenburg",
    URL: "https://357-iz.impfterminservice.de/",
    Adresse: "Schopenhauerstr. 35",
  },
  {
    Zentrumsname: "Impfzentrum Brandenburg",
    PLZ: "14770",
    Ort: "Brandenburg an der Havel",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Magdeburger Landstrasse 228",
  },
  {
    Zentrumsname: "Impfzentrum Luckenwalde",
    PLZ: "14943",
    Ort: "Luckenwalde",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Weinberge 39",
  },
  {
    Zentrumsname: "Impfzentrum Frankfurt",
    PLZ: "15234",
    Ort: "Frankfurt (Oder)",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Messering 3",
  },
  {
    Zentrumsname: "Impfzentrum Eberswalde",
    PLZ: "16225",
    Ort: "Eberswalde",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Heegermühlerstraße 69a",
  },
  {
    Zentrumsname: "Impfzentrum Oranienburg",
    PLZ: "16515",
    Ort: "Oranienburg",
    Bundesland: "Brandenburg",
    URL: "https://357-iz.impfterminservice.de/",
    Adresse: "André-Pican-Str. 42",
  },
  {
    Zentrumsname: "Impfzentrum Kyritz",
    PLZ: "16866",
    Ort: "Kyritz",
    Bundesland: "Brandenburg",
    URL: "https://097-iz.impfterminservice.de/",
    Adresse: "Perleberger Straße 8",
  },
  {
    Zentrumsname: "Impfzentrum Prenzlau",
    PLZ: "17291",
    Ort: "Prenzlau",
    Bundesland: "Brandenburg",
    URL: "https://357-iz.impfterminservice.de/",
    Adresse: "Berliner Straße 29",
  },
  {
    Zentrumsname: "Impfzentrum Perleberg",
    PLZ: "19348",
    Ort: "Perleberg",
    Bundesland: "Brandenburg",
    URL: "https://357-iz.impfterminservice.de/",
    Adresse: "Karl-Liebknecht-Straße 14",
  },
];

type TerminSuchErgebnis =
  | {
      type: "success";
      termineVorhanden: boolean;
      vorhandeneLeistungsmerkmale: (keyof typeof impfstoffNamen)[];
    }
  | {
      type: "error-quota-reached";
    }
  | {
      type: "error";
      message: string;
    };

// env DEBUG="puppeteer:*" npm run run

// app-corona-vaccination > div:nth-child(2) > div > div > label:nth-child(2) > span
// app-corona-vaccination > div:nth-child(2) > div > div > label:nth-child(2) > span
import puppeteer from "puppeteer";

async function checkAppointment(
  browser: puppeteer.Browser,
  zentrum: Impfzentrum
): Promise<TerminSuchErgebnis> {
  const name = `${zentrum.Zentrumsname} (${zentrum.Adresse})`;
  console.log(`checking ${name}...`);

  const page = await browser.newPage();
  await page.goto(`${zentrum.URL}/impftermine/service?plz=${zentrum.PLZ}`, {
    waitUntil: "networkidle2",
  });

  const cookieWarning = await page.$(".cookies-info-close");
  if (cookieWarning) {
    await cookieWarning.click();
  }

  const result = new Promise<TerminSuchErgebnis>(async (resolve) => {
    page.on("requestfinished", async (evt) => {
      if (!evt.url().includes("/rest/suche/termincheck")) return;
      const response = evt.response();
      const ok = response?.ok();
      if (!ok) {
        const status = response?.status();
        const statusText = response?.statusText();
        console.error("request failed");
        if (status === 429) {
          resolve({ type: "error-quota-reached" });
          return;
        }
        const text = await response?.text();
        resolve({ type: "error", message: `${text} (${statusText} - ${status})` });
        return;
      }

      const data = await response?.json();
      resolve(data);
    });
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.click(
    "app-corona-vaccination > div:nth-child(2) > div > div > label:nth-child(2) > span"
  );

  try {
    return await result;
  } finally {
    await page.close();
  }
}

async function impfcheck() {
  console.log(`Starting ${new Date().toISOString()}`);
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250, // slow down by 250ms
    userDataDir: "./puppeteer-user-data-dir",
    // devtools: true,
  });

  let exitCode = 0;

  console.time("appointment check");

  for (const ea of impfzentrenBrandenburg) {
    // if (ea.Zentrumsname !== "Impfzentrum Eberswalde") continue;

    const result = await checkAppointment(browser, ea);
    if (result.type === "error-quota-reached") {
      console.error("Too many requests");
      exitCode = 1;
      break;
    } else if (result.type === "error") {
      exitCode = 2;
      console.error(result.message);
      break;
    } else {
      if (result.termineVorhanden) {
        // console.log(JSON.stringify(result, null, 2));
        let notification = `${ea.Zentrumsname} hat einen Termin`;
        const vaccines = result.vorhandeneLeistungsmerkmale
          .map((ea) => `mit ${impfstoffNamen[ea] ?? "einem unbekannten Impfstoff"}`)
          .join(" und ");
        if (vaccines) {
          notification += " " + vaccines;
        }
        console.log(notification);
        console.log(ea.URL);
        execSync(`say -v "Anna" "${notification}"`);
      }
    }
  }

  await browser.close();

  console.timeEnd("appointment check");

  process.exit(exitCode);
}

async function main() {
  await Promise.race([
    impfcheck(),
    new Promise((_, reject) => setTimeout(() => reject("timeout"), 1000 * 60 * 3)),
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err));
