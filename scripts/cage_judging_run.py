#!/usr/bin/env python3
"""Run local judging checks through the existing, unmodified CAGE modules.

The CAGE checkout stays outside this public application. No model, deploy or
submission calls occur. Runtime inference remains unverified by local checks.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from datetime import datetime, timezone

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cage-root", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    root = args.cage_root.resolve()
    out = args.out.resolve()
    app = Path(__file__).resolve().parent.parent
    # Every invocation gets its own directory; never erase earlier attempts.
    out.mkdir(parents=True, exist_ok=False)
    os.environ["CAGE_RUNTIME_DIR"] = str(out / "runtime")
    sys.path[:0] = [str(root), str(root / "phase15/scripts")]
    from cage_learning import LearningProcess, recall
    from multi_model_harness import MultiModelHarness
    from event_store import append_event, replay
    from summarize_competition_events import build_summary

    def save(name, value):
        (out / name).write_text(json.dumps(value, indent=2) + "\n")

    source_paths = ["phase15/scripts/multi_model_harness.py", "phase15/scripts/event_store.py", "phase15/scripts/runtime_store.py", "cage_learning/process.py", ".cage/ACTIVE_TASK_CONTEXT.json"]
    save("cage-source-digests.json", {p: digest(root / p) for p in source_paths})
    save("recall.json", recall("model inference evidence build success actual routes repeated failed access configuration"))
    plan = MultiModelHarness().plan_swarm("Value Study Studio: run local scoring/control-flow tests and production build; retain actual device/cloud inference blockers and next diagnostics.")
    plan.update(dry_run=True, live_calls=False, note="Planning assignments only; no model invocation or separate review occurred.")
    if plan.get("event_emit") == "fail_open":
        raise RuntimeError("CAGE planner event emission failed; no successful journal claim")
    save("harness-plan.json", plan)
    process = LearningProcess(out / "learning", domain="buildhybridai-2026", task="value-study-studio-judging")
    belief = process.believe("The available source passes its local tests and production build.", kind="effect")
    results = []
    env = dict(os.environ, VITE_FIREBASE_APPCHECK_DEBUG_TOKEN="SYNTHETIC_DEBUG_SENTINEL_NOT_A_CREDENTIAL")
    for label, command in [("tests", ["npm", "test"]), ("build", ["npm", "run", "build"]), ("configuration", ["npm", "run", "check:config"])]:
        started = time.monotonic()
        try:
            result = subprocess.run(command, cwd=app, env=env, capture_output=True, text=True, timeout=120)
            output, code = result.stdout + result.stderr, result.returncode
        except subprocess.TimeoutExpired:
            output, code = "Check exceeded the bounded 120-second timeout.\n", 124
        (out / f"{label}.log").write_text(output)
        row = {"check": label, "exit_code": code, "elapsed_seconds": round(time.monotonic()-started, 3)}
        results.append(row)
        process.observe("run " + label, row, predictions={belief: {"exit_code": 0}} if label != "configuration" else None)
    production_clean = not any(b"SYNTHETIC_DEBUG_SENTINEL_NOT_A_CREDENTIAL" in p.read_bytes() for p in (app / "dist").rglob("*") if p.is_file())
    save("checks.json", {"results": results, "production_debug_sentinel_absent": production_clean, "unit_sdk_doubles_are_synthetic": True})
    artifacts = {str(p.relative_to(app)): digest(p) for p in sorted((app / "dist").rglob("*")) if p.is_file()}
    save("build-manifest.json", {"created_at": datetime.now(timezone.utc).isoformat(), "node": subprocess.check_output(["node", "--version"], text=True).strip(), "files_sha256": artifacts, "true_rsi": False, "true_agi": False})
    local_ok = all(r["exit_code"] == 0 for r in results[:2]) and production_clean
    config_ok = results[2]["exit_code"] == 0
    gate = {"comp": "buildhybridai-2026", "status": "BLOCK", "local_checks_passed": local_ok, "public_configuration_shape_passed": config_ok,
            "device_inference": "UNVERIFIED", "cloud_inference": "UNVERIFIED", "hybrid_inference": "UNVERIFIED",
            "reason": "Live SDK route responses and observed browser evidence remain required. Configuration and account access must be established without creating resources or changing billing.",
            "true_rsi": False, "true_agi": False, "evidence_class": "NON_R0_OPERATIONAL"}
    append_event(kind="guard_check", payload=gate, aggregate_id="comp:buildhybridai-2026", tag="partially_verified")
    lesson = process.lesson(("Local scoring and SDK control-flow checks pass" if local_ok else "One or more local checks failed") + "; genuine model execution cannot be inferred from local checks.",
        general="Separate deterministic local checks from actual provider execution, and initialize user-activated APIs before asynchronous preparation can consume activation.",
        mechanism="runtime_provenance", failure_tag="LIVE_ROUTE_EVIDENCE_MISSING", evidence={"local_checks_passed": local_ok, "configuration_shape_passed": config_ok})
    append_event(kind="lesson_logged", payload={"comp": "buildhybridai-2026", "status": "BLOCK", "reason": lesson["statement"]}, aggregate_id="comp:buildhybridai-2026", tag="partially_verified")
    save("knowledge-hypotheses.json", process.knowledge_nodes(competition="buildhybridai-2026"))
    (out / "belief-audit.txt").write_text(process.audit_text() + "\n")
    save("competition-summary.json", build_summary("buildhybridai-2026"))
    save("journal-replay.json", replay(mode="history"))
    print(json.dumps({"local_checks_passed": local_ok, "configuration_shape_passed": config_ok, "live_routes": "BLOCKED_UNVERIFIED", "evidence": str(out)}))
    return 0 if local_ok else 1

if __name__ == "__main__":
    raise SystemExit(main())
