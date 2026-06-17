#!/usr/bin/make

SHELL:=/usr/bin/bash


# Default locales to build. Add more as needed, e.g., "en es"
LOCALES ?= en es

all:
	@for locale in $(LOCALES); do \
		echo "Building for locale: $$locale"; \
		LOCALE=$$locale npx @11ty/eleventy; \
	done
