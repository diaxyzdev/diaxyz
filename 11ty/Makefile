#!/usr/bin/make

SHELL:=/usr/bin/bash


# Default locales to build. Add more as needed, e.g., "en es"
export TRANSLATE ?= 0
export TRANSLATE_TARGET_LOCALE ?= en
export TRANSLATE_TRY_TRANSLATE ?= 0
export TRANSLATE_SAVE_TRANSLATIONS ?= 0
export TRANSLATE_SAVE_KEYS ?= 1
export TRANSLATE_VERBOSITY ?= 1

.PHONY: all
all: build

.PHONY: build
build:
	npx @11ty/eleventy

.PHONY: scratch
scratch:
	node ./scratch.js

.PHONY: translate
translate:
	node ./translate/translate.js

