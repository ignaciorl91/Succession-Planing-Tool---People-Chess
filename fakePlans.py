import random
import json

# Load Data from JSON
with open('employees.json', 'r') as file:
    employees = json.load(file)


def generate_successor_plan(incumbent):
    incumbent_id = incumbent["Global ID"]
    incumbent_name = incumbent["Name"]
    incumbent_position = incumbent["Position Name"]
    incumbent_zone = incumbent["Zone Fixed"]
    incumbent_band = incumbent["Position Band"]
    
    # Filtrar sucesores posibles excluyendo al incumbent
    possible_successors = [e for e in employees if e["Global ID"] != incumbent_id]
    
    # Elegir entre 1 y 3 sucesores
    num_successors = random.randint(1, 7)
    
    successor_plans = []
    
    for _ in range(num_successors):
        successor = random.choice(possible_successors)
        successor_id = successor["Global ID"]
        successor_position = successor["Position Name"]
        successor_name = successor["Name"]
        
        successor_plans.append({
            "Incumbent Global ID": incumbent_id,
            "Incumbent": incumbent_name,
            "L1 Position": incumbent_position,
            "Successor Global ID": successor_id,
            "Successor Position": successor_position,
            "Successor": successor_name,
            "Readiness Level": random.choice(["Now", "1-2 Years"]),
            "Zone": incumbent_zone,
            "Position Band": incumbent_band
        })
    
    return successor_plans

# Generar planes de sucesión solo para empleados con L1 = "Y"
succession_plans = []
for incumbent in employees:
    succession_plans.extend(generate_successor_plan(incumbent))

# Exportar a JSON
with open('succession_plans.json', 'w') as file:
    json.dump(succession_plans, file, indent=4)
