from openai import OpenAI
import os
import sys

import json

with open("./backend/robot.json", "r") as file:
    robot_capabilities = json.load(file)
with open("./backend/instruction_schema.json", "r") as file:
    instruction_schema = json.load(file)

client = OpenAI(

    api_key=os.environ.get("GROQ_API_KEY"),

    base_url="https://api.groq.com/openai/v1",

)

def action_to_instruction(action):
    prompt = f"""
    You are a JSON-only translator for robot arm commands.
    Convert natural language actions into valid robot instructions.

    Here are the ONLY valid actions and parameters you can use:
    {robot_capabilities}

    RULES:
    - Output JSON ONLY
    - Use only actions and axes defined in capabilities
    - Follow min/max/default values
    - If missing a parameter → use default values
    - If action is unclear → return {{"error": "invalid action"}}
    - Do NOT explain anything

    Output Schema:
    {instruction_schema}

    Convert this instruction:

    """ + action


    response = client.responses.create(

        input = prompt,
        model="llama-3.1-8b-instant",
        max_output_tokens=100
    )

    chroma_response = client.responses.get()
    return response.output_text
