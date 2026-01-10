# AI Code Review with OpenAI Codex

This repository uses [OpenAI Codex](https://platform.openai.com/docs/codex) for automated AI-powered code reviews on pull requests. Codex provides intelligent analysis of code quality, security, performance, and best practices.

## How It Works

When you create or update a pull request, the `codex-review.yml` workflow automatically:

1. **Analyzes** your code changes using advanced AI models
2. **Identifies** potential issues, security vulnerabilities, and improvements
3. **Provides** detailed feedback as a comment on your PR
4. **Saves** the full review as an artifact for later inspection

## Review Coverage

Codex reviews focus on:

### 🔍 Code Quality
- Syntax and style compliance
- Naming conventions and readability
- Code structure and modularity

### 🚀 Performance
- Algorithmic efficiency
- Memory usage and potential leaks
- Bundle size impact

### 🔒 Security
- Input validation and sanitization
- API usage security
- Potential vulnerabilities

### 🏗️ Architecture
- Adherence to project patterns
- 3D rendering optimization
- Data processing efficiency

## Customizing Reviews

### Review Prompts
The review behavior is controlled by `.github/codex/prompts/code-review.md`. You can:

- Modify the review criteria
- Add project-specific guidelines
- Focus on particular technologies (WebGL, Three.js, Mapbox)
- Adjust the review depth and style

## Setup Requirements

### Required Secrets
Add `OPENAI_API_KEY` to your repository secrets to enable AI reviews.

### Permissions
The workflow requires these GitHub permissions:
- `contents: read` - Access repository code
- `pull-requests: write` - Post review comments

## Review Output

### PR Comments
Codex posts structured feedback with:
- 🎯 **Summary**: Overall assessment and risk level
- ✅ **Positive Feedback**: Well-implemented patterns
- 🔴/🟡/🟢/🔵 **Issues**: Categorized by priority
- 🔒 **Security Analysis**: Vulnerability assessments
- 🚀 **Performance Analysis**: Optimization recommendations

### Artifacts
Full review transcripts are saved as workflow artifacts for detailed analysis.

## Troubleshooting

### No Review Generated
- Check that `OPENAI_API_KEY` is set in repository secrets
- Verify the workflow ran successfully in Actions tab
- Ensure PR is opened by a human user (not bot)

### Incomplete Reviews
- Review the workflow logs for error details
- Check if the prompt file exists and is valid
- Verify repository permissions

## Learn More

- [OpenAI Codex Documentation](https://platform.openai.com/docs/codex)
- [Codex GitHub Action](https://developers.openai.com/codex/github-action)
- [Mini Singapore 3D CLAUDE.md](../CLAUDE.md) - Project development guidelines