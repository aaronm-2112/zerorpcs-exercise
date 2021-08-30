const Application = require("spectron").Application;
const assert = require("assert");
const electronPath = require("electron"); // Require Electron from the binaries included in node_modules.
const path = require("path");

describe("Application launch", function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, "..")],
    });
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  //   // UI Tests--------------------------------------------------------------
  it("shows the correct title", function () {
    return this.app.client
      .waitUntilWindowLoaded() // Webdriver.io method (aka Selenium wrapper ) that waits for the Browserwindow's Webcontent's did-finish-loading (or perhaps isLoading) event to end
      .getTitle()
      .then(function (title) {
        assert(title, "Calculator");
      });
  });

  it("shows the correct h1", function () {
    return this.app.client.getText("h1").then(function (text) {
      assert.equal(text, "Calculator");
    });
  });

  it("shows the correct explanation for how to use the app", function () {
    return this.app.client
      .getText(".calculator-explanation")
      .then(function (text) {
        assert.equal(
          text,
          "Input a whole or decimal number in each box. Click the Sum button for your answer."
        );
      });
  });

  it("shows the correct note", function () {
    return this.app.client.getText(".note").then(function (text) {
      assert.equal(text, "Note: This calculator handles negative numbers.");
    });
  });

  it("Has an error message box", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.$$(".error-message").then(function (err) {
        assert.equal(err.length, 1);
      });
    });
  });

  it("Hides the error message box on start", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client
        .getCssProperty(".error-message", "visibility")
        .then((propertyobject) => {
          assert.equal(propertyobject.value, "hidden");
        });
    });
  });

  it("Creates inputs that have a height of 22px", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client
        .getElementSize(".error-message")
        .then((elementObject) => {
          assert.equal(elementObject.height, 22);
        });
    });
  });

  // Window tests----------------------------------------------------------
  it("shows an initial window", function () {
    return this.app.client.getWindowCount().then(function (count) {
      // assert two. dev tools counts as a window
      assert.equal(count, 1);
    });
  });

  it("does not have the developer tools open", function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .browserWindow.isDevToolsOpened()
      .then(function (state) {
        assert.equal(state, false);
      });
  });

  // Interactivity Tests------------------------
  it("returns a sum of 0 when sum is clicked and both integer boxes are empty", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.click(".sum_btn").then(() => {
        return this.app.client.getText(".result").then((text) => {
          assert.equal(text, "0");
        });
      });
    });
  });

  it("returns a sum of 2 when sum is clicked and both integer boxes have positive whole number values", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1").then(() => {
        return this.app.client.setValue("#rhs", "1").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "2");
            });
          });
        });
      });
    });
  });

  it("returns an accurate sum when adding positive and negative whole numbers", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1").then(() => {
        return this.app.client.setValue("#rhs", "-2").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "-1");
            });
          });
        });
      });
    });
  });

  it("returns an accurate sum when adding two negative whole numbers", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "-112").then(() => {
        return this.app.client.setValue("#rhs", "-75").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "-187");
            });
          });
        });
      });
    });
  });

  it("returns an accurate sum when dealing with two neagtive whole numbers that contain multiple minus signs", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "--10").then(() => {
        return this.app.client.setValue("#rhs", "---5").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "5");
            });
          });
        });
      });
    });
  });

  it("returns an accurate sum when dealing with two floating point numbers", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1.7568777").then(() => {
        return this.app.client.setValue("#rhs", "101.24566").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "103.0025377");
            });
          });
        });
      });
    });
  });

  it("returns an accurate sum when dealing with a whole and floating point number", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1").then(() => {
        return this.app.client.setValue("#rhs", "101.24566").then(() => {
          return this.app.client.click(".sum_btn").then(() => {
            return this.app.client.getText(".result").then((text) => {
              assert.equal(text, "102.24566");
            });
          });
        });
      });
    });
  });

  it("returns an answer correctly for a value that exceeds a 64 bit float or integer", function () {
    // 922337203685472112375807.14|92233728921892198891289
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client
        .setValue("#lhs", "922337203685472112375807.14")
        .then(() => {
          return this.app.client
            .setValue("#rhs", "92233728921892198891289")
            .then(() => {
              return this.app.client.click(".sum_btn").then(() => {
                return this.app.client.getText(".result").then((text) => {
                  assert.equal(text, "1014570932607364311267096.14");
                });
              });
            });
        });
    });
  });

  // Interactivity Error Testing
  it("creates the error message box when a user inputs invalid characters in left box", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "p").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("creates the error message box when a user inputs invalid characters in right box", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#rhs", "!").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("creates the error message box when a user inputs invalid decimal separator characters in left box", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1..").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("creates the error message box when a user inputs invalid decimal separator characters in right box", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#rhs", "1..").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("creates the error message box when a user inputs minus signs to the right of a number", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1-").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("creates the error message box when a user inputs minus signs to the right of a number", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#rhs", "1-").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            assert.equal(value, true);
          });
      });
    });
  });

  it("hides the error message box after a user clicks on the close error button", function () {
    return this.app.client.waitUntilWindowLoaded().then(() => {
      return this.app.client.setValue("#lhs", "1-").then(() => {
        return this.app.client
          .waitForVisible(".error-message", 3000)
          .then((value) => {
            return this.app.client.click(".close-error-btn").then(() => {
              return this.app.client
                .waitForVisible(".error-message", 3000, true)
                .then((inVisible) => {
                  assert.equal(inVisible, true);
                });
            });
          });
      });
    });
  });
});
