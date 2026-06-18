#!/usr/bin/make

SHELL:=/usr/bin/bash


# Default locales to build. Add more as needed, e.g., "en es"
export LOCALE ?= en es
export TRANSLATE ?= 0

.PHONY: build
build:
	node scratch.js

.PHONY: al	l
all:
	@for locale in $(LOCALES); do \
		echo "Building for locale: $$locale"; \
		LOCALE=$$locale npx @11ty/eleventy; \
	done
