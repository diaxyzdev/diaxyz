#!/usr/bin/make

##################################################
# Make config
##################################################
.SUFFIXES: # Clear all suffix-based implicit rules
.DELETE_ON_ERROR:
SHELL							:= /bin/bash
.DEFAULT_GOAL			:= all

##################################################
# Tools
##################################################
ECMA_VERSION := es2024
NODE_VERSION := 24.16.0
NODE_VVERSION := v$(NODE_VERSION)
NVM_BIN := /home/pnoulis/.nvm/versions/node/$(NODE_VVERSION)/bin
NODE := $(NVM_BIN)/node
PRETTIER := $(NVM_BIN)/prettier

.PHONY: format
format:
	$(PRETTIER) --config ../prettier.config.js --write 'src/**/index.html'
	$(PRETTIER) --config ../prettier.config.js --write 'src/**/*.liquid'
