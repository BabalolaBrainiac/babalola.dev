export interface VirtualFile {
  path: string;
  content: string;
  language: string;
  readOnly?: boolean;
  solution?: string;
}

export interface CourseDay {
  id: string;
  title: string;
  duration: string;
  content: string;
  tasks: { id: string; label: string }[];
  files?: VirtualFile[];
  validation?: {
    type: 'output_match' | 'regex_match' | 'manual';
    target: string;
    successMessage: string;
  };
}

export const mlopsWeek1: CourseDay[] = [
  {
    id: 'day-1',
    title: 'DAY 1 — THE ML SYSTEMS REALITY CHECK',
    duration: '2 Hours',
    content: `
# The ML Systems Reality Check

Welcome, Engineer. 

You are here to transition from writing toy scripts in a Jupyter Notebook to designing, building, and maintaining planet-scale AI infrastructure. As a Senior Principal MLOps Engineer, your job is not to build models. Your job is to build the *factory* that builds, serves, and monitors models.

Today, we confront the hardest truth in our industry, coined by Google researchers in their seminal paper: **"Hidden Technical Debt in Machine Learning Systems."**

## 1. The 5% Illusion
In a real-world AI system, the actual Machine Learning code—the neural network definitions, the PyTorch training loops—accounts for roughly **5%** of the total codebase. The other 95% is "plumbing": data collection, feature extraction, infrastructure, monitoring, and serving.

When you only focus on the 5%, you accumulate immense technical debt in the 95%.

## 2. CACE: Changing Anything Changes Everything
In traditional software engineering, we rely on **encapsulation**. If you change a function deep in a backend service, as long as the API contract remains the same, the frontend doesn't care.

Machine Learning breaks this abstraction completely because **data is the API**.

This leads to the **CACE Principle (Changing Anything Changes Everything)**. 
If you have a model predicting housing prices based on \`square_footage\`, \`zip_code\`, and \`num_bedrooms\`:
* If you decide to add a new feature, \`proximity_to_transit\`, the weights for \`square_footage\` and \`zip_code\` will change during the next training run. 
* If the distribution of \`zip_code\` changes in the real world, the model's reliance on \`num_bedrooms\` might implicitly shift.

**The Senior Infra Takeaway:** You cannot isolate features. You must version your data exactly like you version your code.

## 3. Data Dependency Debt
Code dependencies (like importing a library) are static. If the library updates and breaks your code, your compiler or CI/CD pipeline catches it before production.

Data dependencies are dynamic, silent, and deadly. 
Imagine your model consumes a "user_age" signal from the profile team. One day, the profile team changes their default null value from \`0\` to \`-1\`. Your code won't crash. Your pipeline won't fail. But your model's predictions will silently degrade, costing the business millions before anyone notices.

## 4. Pipeline Jungles and Glue Code
As systems grow, data scientists often write "glue code"—scripts that pull data from one database, join it with a CSV, format it for PyTorch, and dump it to an S3 bucket. Over time, this becomes a **Pipeline Jungle**.

**Your Job:** Destroy pipeline jungles. Implement strict Data Contracts and use orchestration tools (like Airflow or Dagster) to make data flow declarative, observable, and reproducible.

---

### Current systems note: AgentOps & LLMOps
> Traditional MLOps (CI/CD for ML) has rapidly evolved into **AgentOps**. We are no longer just deploying static prediction models; we are deploying autonomous Agentic Workflows.
> 
> *   **From Pipelines to Loops:** RAG (Retrieval-Augmented Generation) is no longer a linear "search and stuff" process. It is an iterative loop where an agent reasons, searches, evaluates the result, and self-corrects.
> *   **FinOps for AI:** As agentic systems consume millions of tokens in iterative loops, tracking and optimizing API costs (routing simple tasks to Small Language Models like Llama-3-8B and complex tasks to GPT-4o/Claude 3.5) is now a core MLOps discipline.

---

## Today's Assignment: The Data Contract

Let's get hands-on with Python. As an infra engineer, you need to enforce boundaries. We will simulate a **Data Contract** using Python logic (similar to what libraries like \`pydantic\` do under the hood).

Look at the File Explorer on the left. We have an incoming data stream that is chaotic (\`main.py\`). 
Your task is to open \`data_contract.py\` and define a rigid validation function that will crash loudly if the data team sends us bad data, rather than letting it poison our ML model.

### Explicit Coding Instructions: What to Type in \`data_contract.py\`

Your goal is to validate the \`raw_data\` dictionary. Specifically, you are checking two fields: \`age\` and \`features\`.

**Step 1: Validate the \`age\` field against negative numbers.**
We expect the \`age\` field to be a positive integer or zero. If the data team sends us a negative number (like \`-1\`), it means their sensors failed.
*   **What to type:**
    \`\`\`python
    age = raw_data.get('age')
    if age is not None and age < 0:
        raise ValueError("Age cannot be negative")
    \`\`\`
*   *Why?* The \`.get('age')\` method safely retrieves the value. If \`age\` is \`< 0\`, we immediately halt the program by raising an error.

**Step 2: Validate the \`features\` array against non-float data types.**
We expect the \`features\` field to be a list containing ONLY numbers with decimals (floats). If a string (like \`"error"\`) sneaks in, our matrix multiplication will crash the entire model.
*   **What to type:**
    \`\`\`python
    features = raw_data.get('features', [])
    if not all(isinstance(f, float) for f in features):
        raise ValueError("Features must be floats")
    \`\`\`
*   *Why?* We default to an empty list \`[]\` if features is missing. Then we use a generator \`isinstance(f, float) for f in features\` inside the \`all()\` function. This checks every single item in the list. If even one item is NOT a float, it raises an error.

**Step 3:** Click **▶ Run System** in the top right. If you typed the validation correctly, it will catch the bad payload and print "CRITICAL INGESTION HALTED". If you are completely stuck, click **Reveal Solution**.
    `,
    tasks: [
      { id: 'd1-t1', label: 'Internalize the CACE Principle and the 5% Illusion.' },
      { id: 'd1-t2', label: 'Open data_contract.py in the IDE.' },
      { id: 'd1-t3', label: 'Implement the Python validation logic using .get() and isinstance().' },
      { id: 'd1-t4', label: 'Execute the pipeline and halt the invalid payload.' },
    ],
    files: [
      {
        path: 'main.py',
        language: 'python',
        readOnly: true,
        content: `from data_contract import validate_payload

# This represents an incoming request from an upstream data team.
# It is messy. It is exactly what causes silent failures in ML.
raw_payload = {
    "user_id": "10485",
    "age": -1, # Oh no! The data team changed the default null value!
    "features": [0.4, 0.8, "error", 0.1] # Wait, why is there a string in our float array?
}

if __name__ == "__main__":
    print("--- ML INGESTION PIPELINE START ---")
    try:
        validated_data = validate_payload(raw_payload)
        print("SUCCESS: Data passed the contract.")
        print(validated_data)
    except Exception as e:
        print("❌ CRITICAL INGESTION HALTED: Contract Violation!")
        print(str(e))
`
      },
      {
        path: 'data_contract.py',
        language: 'python',
        content: `import json

class MLDataContract:
    def __init__(self, user_id: int, age: int, features: list[float]):
        self.user_id = user_id
        self.age = age
        self.features = features

def validate_payload(raw_data: dict) -> dict:
    """
    Follow the instructions in the reading panel to write this function.
    
    1. Extract 'age' using raw_data.get('age')
    2. Check if age < 0, if so, raise ValueError("Age cannot be negative")
    3. Extract 'features' using raw_data.get('features', [])
    4. Ensure all features are floats using isinstance(f, float) inside an all() check.
       If not, raise ValueError("Features must be floats")
    """
    
    # ----------------------------------------
    # WRITE YOUR PYTHON VALIDATION LOGIC HERE:
    # ----------------------------------------
    
    
    
    # Return the dictionary if it passes all checks
    return raw_data
`,
        solution: `import json

class MLDataContract:
    def __init__(self, user_id: int, age: int, features: list[float]):
        self.user_id = user_id
        self.age = age
        self.features = features

def validate_payload(raw_data: dict) -> dict:
    # 1. Safely extract and check age
    age = raw_data.get('age')
    if age is not None and age < 0:
        raise ValueError("Age cannot be negative")
        
    # 2. Safely extract and validate features array
    features = raw_data.get('features', [])
    if not all(isinstance(f, float) for f in features):
        raise ValueError("Features must be floats")
        
    return raw_data
`
      }
    ],
    validation: {
      type: 'output_match',
      target: 'CRITICAL INGESTION HALTED',
      successMessage: 'Outstanding. You successfully implemented a data contract. The pipeline is safe.'
    }
  },
  {
    id: 'day-2',
    title: 'DAY 2 — MLOPS FAILURE MODES',
    duration: '2 Hours',
    content: `
# MLOps Failure Modes: How Things Break in Silence

Welcome back, Engineer. Yesterday, we learned about the systemic debt of ML. Today, we look at the specific, mechanical ways models fail in production.

As an AI Infra engineer, you must assume the model is a black box that will eventually degrade. Your infrastructure must detect the degradation.

## 1. Training-Serving Skew
This is the #1 killer of ML deployments.
**Definition:** The data the model sees during training is fundamentally different from the data it sees in production.

**How it happens:**
*   **Code Skew:** The Python script that extracts features for training is slightly different than the Java/Go code extracting features in the production API.
*   **Time Travel:** During training, your data scientists accidentally included data from the "future" (e.g., using a user's total session length to predict if they will click an ad in the first 5 minutes).

**Infra Solution:** You must log the *exact* features used at serving time, and use *those logs* as the training data for the next version of the model.

## 2. Concept Drift & Data Drift
The world changes. A model trained to predict housing prices in 2019 is completely useless in 2021.
*   **Concept Drift:** The relationship between inputs and outputs changes (e.g., people's buying habits change during a pandemic).
*   **Data Drift:** The distribution of the inputs changes (e.g., your app expands to a new country, changing the demographic data).

**Infra Solution:** Automated retraining pipelines triggered by statistical distribution checks (e.g., Kullback-Leibler divergence) on incoming data streams.

## 3. Data Completeness & Staleness
A feature store is a database designed specifically for ML features. If a real-time feature (like "items added to cart in the last 5 minutes") goes down, the model will receive \`null\` or \`0\`. The model will silently output garbage predictions.

**Infra Solution:** "Data Freshness" monitoring. Your infrastructure must have SLAs on feature pipelines, alerting if a table hasn't been updated in X hours.

---

### Current systems note: LLM-as-a-Judge Evaluation
> In traditional MLOps, we evaluated models using static metrics like F1-score or RMSE. In the era of LLMs, we are evaluating *generative* text, which is incredibly difficult.
> 
> **The New Standard:** "LLM-as-a-Judge." We now deploy specialized, smaller LLMs (or prompt highly capable ones) whose sole job is to grade the outputs of our primary system in real-time. We grade for **Faithfulness** (did it hallucinate?), **Answer Relevance** (did it actually answer the user?), and **Context Precision** (was the retrieved context useful?). 
> 
> Infra engineers are now responsible for building the CI/CD pipelines that run these LLM evaluations on every pull request.

---

## Today's Assignment: Drift Detection

We are going to simulate a basic Data Drift detector.
In \`monitor.py\`, you will write a function that compares the mean of an incoming batch of data against our training baseline. If it deviates by more than our threshold, it should trigger an alert.

### Instructions & Python Guide:
1.  **Open \`monitor.py\`** in the File Explorer.
2.  **Calculate the Mean:** You need to sum up all the numbers in the \`production_batch\` list and divide by how many numbers there are.
    *   *Python Tip:* Do not write a \`for\` loop! Python has highly optimized built-in functions. Use \`sum(list)\` and \`len(list)\`.
    *   *Type this:* \`mean_val = sum(production_batch) / len(production_batch)\`
3.  **Calculate the Difference:** We need to know how far off the mean is from the \`baseline\`. We want the absolute difference (positive number).
    *   *Python Tip:* Use the built-in \`abs()\` function.
    *   *Type this:* \`abs_diff = abs(mean_val - baseline)\`
4.  **Trigger the Alert:** Write an \`if/else\` block to check if the \`abs_diff\` is greater than the \`threshold\`.
    *   *Type this:*
        \`\`\`python
        if abs_diff > threshold:
            print("ALERT: DATA DRIFT DETECTED!")
        else:
            print("Data stream nominal.")
        \`\`\`
5.  Click **Run System**.
    `,
    tasks: [
      { id: 'd2-t1', label: 'Understand Training-Serving Skew and Concept Drift.' },
      { id: 'd2-t2', label: 'Open monitor.py in the IDE.' },
      { id: 'd2-t3', label: 'Implement drift detection using Python built-in functions sum(), len(), and abs().' },
      { id: 'd2-t4', label: 'Run the system to detect the simulated production drift.' },
    ],
    files: [
      {
        path: 'main.py',
        language: 'python',
        readOnly: true,
        content: `from monitor import detect_drift

# Baseline mean calculated during training
TRAINING_BASELINE_MEAN = 50.0
DRIFT_THRESHOLD = 5.0 # If difference is > 5.0, we have drift

# Production data streams in...
batch_1 = [48.5, 51.2, 49.9, 50.1, 49.5] # Looks normal
batch_2 = [60.1, 62.3, 59.8, 65.0, 61.2] # Something changed in the world!

if __name__ == "__main__":
    print("Checking Batch 1...")
    detect_drift(batch_1, TRAINING_BASELINE_MEAN, DRIFT_THRESHOLD)
    
    print("\\nChecking Batch 2...")
    detect_drift(batch_2, TRAINING_BASELINE_MEAN, DRIFT_THRESHOLD)
`
      },
      {
        path: 'monitor.py',
        language: 'python',
        content: `def detect_drift(production_batch: list[float], baseline: float, threshold: float):
    """
    Follow the instructions in the reading panel to write this function.
    
    1. Calculate the mean: sum(production_batch) / len(production_batch)
    2. Calculate absolute difference: abs(mean - baseline)
    3. If the difference is > threshold, print "ALERT: DATA DRIFT DETECTED!"
    4. Else, print "Data stream nominal."
    """
    
    # ----------------------------------------
    # WRITE YOUR PYTHON DRIFT LOGIC HERE:
    # ----------------------------------------
    
    
    pass
`,
        solution: `def detect_drift(production_batch: list[float], baseline: float, threshold: float):
    # 1. Calculate the mean using built-in functions
    mean_val = sum(production_batch) / len(production_batch)
    
    # 2. Calculate absolute difference
    abs_diff = abs(mean_val - baseline)
    
    # 3. Alert logic
    if abs_diff > threshold:
        print("ALERT: DATA DRIFT DETECTED!")
    else:
        print("Data stream nominal.")
`
      }
    ],
    validation: {
      type: 'output_match',
      target: 'ALERT: DATA DRIFT DETECTED!',
      successMessage: 'Drift detected! You successfully simulated an infra-level statistical monitor.'
    }
  }
];