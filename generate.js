const fs = require("fs");
const path = require("path");

function main() {
  let template = fs.readFileSync("template.html", { encoding: "utf8" });

  let titles = {
    "index.html": "Home",

    "services/index.html": "Services",

    "news/index.html": "News",
    "news/launch.html": "Launch (6 June 2025)",

    "projects/index.html": "Projects",
    "projects/lab/index.html": "Other in-progress projects",
    "projects/ltn/index.html": "The Low-Traffic Neighbourhood Tool",
    "projects/npw/index.html": "Network Planning Workspace",
    "projects/pyats/index.html": "Plan Your Active Travel Schemes",
    "projects/route_check/index.html": "Route Check",
    "projects/santa/index.html": "15-minute Santa",
    "projects/traffic_sim/index.html": "A/B Street traffic simulator",
  };
  let copyTypes = [".css", ".svg", ".webp", ".ico"];

  for (let inputPath of listFiles("input")) {
    if (inputPath.endsWith(".swp")) {
      continue;
    }

    let outputPath = inputPath.replace("input/", "output/");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    if (inputPath.endsWith(".html")) {
      let contents = fs.readFileSync(inputPath, { encoding: "utf8" });

      if (inputPath == "input/index.html") {
        // Append projects
        let append = fs.readFileSync("input/projects/index.html", {
          encoding: "utf8",
        });
        contents += append;
      }

      let title = titles[inputPath.slice("input/".length)];
      if (!title) {
        throw new Error(`No title for ${inputPath}`);
      }
      let output = template
        .replaceAll("{TITLE}", title)
        .replace("{CONTENT}", contents)
        .replaceAll(
          /<link\s+href="(.*?)"\s*\/>/g,
          (_, url) =>
            `<a href="${url}" target="_blank">${stripPrefix(url, "https://")}</a>`,
        );

      console.log(`Generating ${outputPath}`);
      fs.writeFileSync(outputPath, output);
    } else if (copyTypes.some((suffix) => inputPath.endsWith(suffix))) {
      console.log(`Copying ${outputPath}`);
      fs.copyFileSync(inputPath, outputPath);
    } else {
      throw new Error(`Unknown file ${inputPath}`);
    }
  }
}

function listFiles(dir) {
  let results = [];
  for (let entry of fs.readdirSync(dir, { withFileTypes: true })) {
    let fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function stripPrefix(x, prefix) {
  return x.startsWith(prefix) ? x.slice(prefix.length) : x;
}

main();
