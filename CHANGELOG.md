# Changelog

All notable changes to the **Qalandar** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to Semantic Versioning.
## [1.0.1] - 2026-06-03
* Added naming updates and SEO tags
## [1.0.0] - 2026-06-03

### Added

* Initial release of Qalandar for Visual Studio Code.
* Integration with local Ollama models.
* AI-powered code generation directly inside the editor.
* **Ask With Context** mode (`Alt + F9`) that sends the active editor content as reference.
* **Ask Without Context** mode (`Shift + F9`) for standalone code generation.
* Configurable AI model through VS Code settings.
* Default model set to `qwen2.5-coder:7b`.
* Status notifications for AI requests and responses.
* Extension icon and marketplace assets.
* Documentation and setup guide.

### Requirements

* Ollama must be installed and running locally.
* Recommended model: `qwen2.5-coder:7b`.

### Notes

This is the first public release of Qalandar, providing a lightweight bridge between Visual Studio Code and local Ollama-powered coding models.
