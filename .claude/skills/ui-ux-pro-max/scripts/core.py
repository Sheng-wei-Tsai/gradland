import os
import sys
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

# Configure logging to ensure errors are visible and not swallowed
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('analysis.log')
    ]
)
logger = logging.getLogger(__name__)

def run_daily_analysis() -> Dict[str, Any]:
    """
    Executes the daily analysis pipeline.
    Ensures no silent failures occur during execution.
    """
    start_time = datetime.now()
    results = {
        "date": start_time.strftime("%Y-%m-%d"),
        "status": "success",
        "errors": [],
        "metrics": {}
    }

    try:
        logger.info(f"Starting Daily Analysis for {results['date']}")
        
        # Import local modules
        from .design_system import analyze_design_system
        from .search import run_search_index_check

        # 1. Analyze Design System
        logger.info("Running design system analysis...")
        design_metrics = analyze_design_system()
        results["metrics"]["design_system"] = design_metrics

        # 2. Run Search Index Check
        logger.info("Running search index check...")
        search_metrics = run_search_index_check()
        results["metrics"]["search_index"] = search_metrics

        # 3. Validate Data Integrity (Simulated check for CSVs)
        data_files = [
            "data/charts.csv",
            "data/colors.csv",
            "data/icons.csv",
            "data/landing.csv",
            "data/products.csv"
        ]
        
        for file_path in data_files:
            full_path = os.path.join(os.path.dirname(__file__), file_path)
            if not os.path.exists(full_path):
                # Explicitly log missing files instead of failing silently
                error_msg = f"Critical: Data file missing: {full_path}"
                logger.error(error_msg)
                results["errors"].append(error_msg)
                results["status"] = "degraded"
            else:
                logger.debug(f"Verified file: {file_path}")

        if results["errors"]:
            logger.warning(f"Analysis completed with {len(results['errors'])} errors.")
        else:
            logger.info("Daily Analysis completed successfully.")

    except Exception as e:
        # CRITICAL FIX: Catch all exceptions to prevent silent failure
        error_msg = f"Fatal error during analysis: {str(e)}"
        logger.exception(error_msg) # Logs the full traceback
        results["status"] = "failed"
        results["errors"].append(error_msg)
        
    finally:
        end_time = datetime.now()
        results["duration_seconds"] = (end_time - start_time).total_seconds()
        logger.info(f"Analysis finished in {results['duration_seconds']:.2f}s")

    return results

if __name__ == "__main__":
    # Allow running this script directly for testing
    output = run_daily_analysis()
    print("\n--- Analysis Report ---")
    print(f"Status: {output['status']}")
    print(f"Duration: {output['duration_seconds']}s")
    if output['errors']:
        print("Errors encountered:")
        for err in output['errors']:
            print(f"  - {err}")
    else:
        print("No errors encountered.")