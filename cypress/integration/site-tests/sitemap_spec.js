// read the sitemaps of a WordPress Site and visit every link
// analyse first level xml pointing to xml-files
let sitemaps = [];
let allurl = [];

// get first level of sitemaps and generate final array with urls
before( () => {
    cy.request({
        url: "https://www.berg-reise-foto.de/sitemap.xml",
        headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
        },
    })
    .as("sitemap")
    .then((response) => {
    sitemaps = Cypress.$(response.body)
        .find("loc")
        .toArray()
        .map((el) => el.innerText);
    });
})

// get second level of sitemaps and generate final array with urls
before( () => {
   sitemaps.forEach((url) => {
        cy.request({
          url: url,
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
            },
        })
        .as("sitemap")
        .then((response) => {
            let newurls = Cypress.$(response.body).find('loc').toArray().map((el) => el.innerText);
            allurl.push.apply(allurl, newurls);
        });
    });
})

// log the time spent of the test
let commands = []

Cypress.on('test:after:run', (attributes) => {
  /* eslint-disable no-console */
  console.log('Test "%s" has finished in %dms', attributes.title, attributes.duration)
  console.table(commands)
  commands.length = 0
})

Cypress.on('command:start', (c) => {
  let locurl = ''
  if (c.attributes.name === 'request') {
    try {
      locurl = c.attributes.args[0].url
    } catch (e) {
      locurl = ''
    }
  } else if (c.attributes.name === 'visit') {
    try {
      locurl = c.attributes.args[0]
    } catch (e) {
      locurl = ''
    }
  }

  commands.push({
    name: c.attributes.name,
    url: locurl,
    started: +new Date(),
  })
})

Cypress.on('command:end', (c) => {
  const lastCommand = commands[commands.length - 1]

  if (lastCommand.name !== c.attributes.name) {
    throw new Error('Last command is wrong')
  }

  lastCommand.endedAt = +new Date()
  lastCommand.elapsed = lastCommand.endedAt - lastCommand.started
})
// end time logging

// visit all urls
it("should succesfully get the header of each url", () => {
    allurl.forEach((url, index) => {
      //if (index > 5) return false;
      cy.request({
        url: url,
        headers: {
          "Content-Type": "text/html",
          accept: "*/*",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
        },
      }).then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.headers['content-type']).to.eq('text/html; charset=UTF-8')
      });
    });
  });

// visit all urls
it("should succesfully load each url in the sitemap", () => {
  allurl.forEach((url, index) => {
    //if (index > 5) return false;
    cy.visit(url).then((contentWindow) => {
      // contentWindow is the remote page's window object
    })
  });
});  