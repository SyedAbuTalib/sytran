#!/usr/bin/env node

const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const axios = require("axios");
const fileDownload = require("js-file-download");

const SYTRAN_URL = "https://sytran-backend.herokuapp.com/";

function isFileExist(path) {
  try {
    if (fs.existsSync(path)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
  }
}

function getFileName(url) {
  return url.substring(url.lastIndexOf("/") + 1);
}

async function downloadFile(fileUrl) {
  if(process.env.PWD) {
    outputLocationPath = process.env.PWD;
  } else {
    outputLocationPath = process.cwd();
  }
  const writer = fs.createWriteStream(
    outputLocationPath + "/" + getFileName(fileUrl)
  );

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((res) => {
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      res.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

yargs(hideBin(process.argv))
  .command(
    "push [file] [short]",
    "push a file to the server with a shorthand",
    (yargs) => {
      yargs
        .positional("file", {
          describe: "path to file",
        })
        .positional("short", {
          describe: "short phrase to use as an identifier on the server",
        });
    },
    (argv) => {
      if (argv.file) {
        if (isFileExist(argv.file)) {
          if (argv.short) {
            const FormData = require("form-data");
            const form = new FormData();

            form.append("item[name]", argv.short);
            form.append("item[file]", fs.createReadStream(argv.file));
            axios
              .post(SYTRAN_URL + "items/", form, { headers: form.getHeaders() })
              .then(
                (res) => {
                  console.log("sent!");
                },
                (err) => {
                  if (err.response.status == 422) {
                    console.log(
                      "Error",
                      err.response.status,
                      "-",
                      err.response.statusText,
                      "(usually need to pick a unique alphanumeric shorthand)"
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
          } else {
            console.log("missing shorthand");
          }
        } else {
          console.log("File could not be found");
        }
      } else {
        console.log("missing path to file");
      }
    }
  )
  .command(
    "pull [short]",
    "pull from the server using a shorthand",
    (yargs) => {
      yargs.positional("short", {
        describe: "short phrase to use as an identifier on the server",
      });
    },
    (argv) => {
      if (argv.short) {
        axios.get(SYTRAN_URL + "items/" + argv.short).then(
          (res) => {
            downloadFile(SYTRAN_URL + res.request.socket._httpMessage.path);
          },
          (err) => {
            console.log(err);
            if (err.response.status == 404) {
              console.log(
                "file either doesn't exist or has been removed! (all files get removed once every 24 hours)"
              );
            } else {
              console.log(err);
            }
          }
        );
      } else {
        console.log("need short");
      }
    }
  )
  .argv;
