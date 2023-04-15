before(() => {
  cy.disconnectMetamaskWalletFromAllDapps()
})

const USER_ADDRESS = "0x304Def656Babc745c53782639D3CaB00aCe8C843"
const MOCK_AUTH_DATA = {
  type: "OAUTH_SUCCESS",
  data: {
    platformName: "DISCORD",
    scope: "guilds identify guilds.members.read",
  },
}

describe("create-discord-guild", () => {
  before(() => {
    cy.visit("/create-guild", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("winOpen")
      },
    })
    cy.connectWallet()
  })

  it("can authenticate with Discord and create a guild", () => {
    cy.getByDataTest("DISCORD-select-button").click()

    cy.intercept(`${Cypress.env("guildApiUrl")}/guild/listGateables`, {
      statusCode: 200,
      fixture: "testUserDiscordGateables.json",
    }).as("fetchDiscordGateables")

    cy.intercept(`${Cypress.env("guildApiUrl")}/user/connect`, {
      statusCode: 200,
      fixture: "connectDiscord.json",
    }).as("connectDiscord")

    cy.getByDataTest("DISCORD-select-button").click()
    cy.get("@winOpen").should("be.called")

    cy.window().then((popupWindow) => {
      popupWindow.localStorage.setItem(
        "DISCORD_shouldConnect",
        JSON.stringify(MOCK_AUTH_DATA)
      )
      popupWindow.close()
    })

    cy.wait("@connectDiscord")

    cy.visit("/create-guild")

    // Intercepting this request, so we can set the `DISCORD-select-button-connected` data-test attribute properly
    cy.intercept(`${Cypress.env("guildApiUrl")}/user/${USER_ADDRESS}`, (req) => {
      req.continue((res) => {
        res.body = {
          ...res.body,
          platformUsers: [
            {
              platformId: 1,
              platformName: "DISCORD",
              platformUserId: "12345",
            },
          ],
        }
      })
    }).as("modifiedUserResponse")

    // Select server
    cy.getByDataTest("DISCORD-select-button-connected").click()
    cy.wait("@fetchDiscordGateables")

    cy.intercept(`${Cypress.env("guildApiUrl")}/platform/guild/DISCORD/*`).as(
      "useGuildByPlatformId"
    )
    cy.wait("@useGuildByPlatformId")

    cy.getByDataTest("select-dc-server-button").click()
    cy.get("video[src='/videos/dc-bot-role-config-guide.webm']").should("exist")

    cy.findByText("Next").click()

    // Select a template
    cy.findByText("Growth").click({ force: true })
    cy.get("div[aria-current='step']").last().should("contain.text", "Growth")
    cy.findByText("Start from scratch").click({ force: true })
    cy.get("div[aria-current='step']").last().should("contain.text", "Basic")

    cy.findByText("Next").click()

    // Check if the form is valid
    cy.get("input[name='name']").should("have.value", Cypress.env("guildName"))

    // Create guild
    cy.getByDataTest("create-guild-button").should("be.enabled")
    cy.getByDataTest("create-guild-button").click()

    cy.intercept("POST", `${Cypress.env("guildApiUrl")}/guild`).as(
      "createGuildRequest"
    )

    cy.wait("@createGuildRequest")
  })

  it(`/${Cypress.env("guildUrlName")} exists`, () => {
    cy.visit(`/${Cypress.env("guildUrlName")}`)
    cy.get("h1").should("contain.text", Cypress.env("guildName"))
  })
})

export {}
