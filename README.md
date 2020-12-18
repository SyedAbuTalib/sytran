# Sytran: easy command line file transfer

## Reasoning

I wanted to learn how to use ActiveStorage for Rails as well as programming a Node command line tool. I may switch from Heroku's disk to an S3 instance if it appears to be worth the costs.

## Installation

`npm i -g sytran`

## How to Use

Pushing a file to the server: `sytran push example.py asdf`

Pulling a file from the server: `sytran pull asdf` (will keep the original name of `example.py`)

## Notes

Currently the server is limited to 10 megabytes per file. It is hosted on Heroku, which uses an ephermeral disk method, meaning files will be automatially deleted in 24 hours.

Files are PUBLIC! Do not place sensitive data into the server. This means that anyone can run `sytran pull asdf`.

## Related

Code for the server is at https://github.com/SyedAbuTalib/sytran-backend.
