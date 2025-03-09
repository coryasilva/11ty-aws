import { stripIndent } from "common-tags";
import site from "./_data/site.js";

class RobotsTxt {
  data() {
    return {
      permalink: "/robots.txt",
      eleventyExcludeFromCollections: true,
    };
  }

  render(_data) {
    return stripIndent`
      Sitemap: ${site.baseUrl}/sitemap.xml

      User-agent: *
      Disallow:

    `;
  }
}

export default RobotsTxt;
