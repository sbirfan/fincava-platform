# FINCAVA Feature: Phase I – AI Workspace (Prompt Runner + Simple Automation)

## Purpose

Provide practical AI assistance for day-to-day operations without introducing agents or complex workflow orchestration.

## Goals

- Execute reusable prompts through Claude API.
- Support manual execution from the Admin interface.
- Support simple event-driven automations.
- Produce internal drafts and assessments for founder review.
- Keep the implementation understandable for a single-founder business.

## Core Architecture

```text
Business Event or Manual Button
            ↓
      Prompt Selection
            ↓
   Prepare Operational Data
            ↓
       Claude API
            ↓
      AI Assessment/Draft
            ↓
 Founder Reviews & Acts
```

## Manual Triggers

- Generate buyer response
- Review sourcing request
- Review verification request
- Daily priorities

## Automatic Triggers

- New sourcing request → Internal review
- New verification request → Initial assessment
- (Optional later) Daily operations summary

Automatic executions must never:
- send emails
- approve requests
- change business records
- commit pricing

## Deliverables

- AI Workspace page
- Prompt library (Markdown)
- Claude API integration
- Event → Prompt mapping
- Result viewer
- Copy/regenerate
- Basic logging

## Out of Scope

- Agents
- Multi-step workflows
- Prompt editor
- Workflow engine
- Autonomous actions

## Success Criteria

AI reduces founder review time while every business decision remains human-approved.
