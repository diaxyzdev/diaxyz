#!/usr/bin/make

SHELL:=/usr/bin/bash
PORT ?= 8080
.DEFAULT_GOAL: all

.PHONY: all
all: build

.PHONY: build
build:
	npx @11ty/eleventy

.PHONY: serve
serve:
	npx @11ty/eleventy --serve --port=$(PORT)
