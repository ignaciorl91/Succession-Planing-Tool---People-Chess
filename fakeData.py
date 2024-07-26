import random
import json
import faker

# Inicializar el generador de datos falsos
fake = faker.Faker()

continents = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"]

position_names = [
    "Software Engineer",
    "Product Manager",
    "Sales Director",
    "HR Specialist",
    "Marketing Manager",
    "Financial Analyst",
    "Operations Manager",
    "Business Development Manager",
    "Customer Service Representative",
    "Chief Technology Officer",
    "Project Coordinator",
    "Data Scientist",
    "Quality Assurance Analyst",
    "IT Support Specialist",
    "Account Manager",
    "Graphic Designer",
    "Supply Chain Manager",
    "Legal Advisor",
    "Research Scientist",
    "Database Administrator",
    "UX/UI Designer",
    "Technical Lead",
    "Consultant",
    "Executive Assistant",
    "Corporate Trainer",
    "Sales Associate",
    "Content Writer",
    "Digital Marketing Specialist",
    "Business Analyst",
    "Chief Financial Officer"
]



def generate_employee(id):
    zone = random.choice(continents)
    return {
        "Global ID": str(id).zfill(3),
        "Name": fake.name(),
        "Position Name": random.choice(position_names),
        "Zone Fixed": zone,
        "Zone Location": zone,
        "L1": random.choice(["Y", "N"]),
        "LTP": random.choice(["Y", "N"]),
        "CR": random.choice(["Y", "N"]),
        "Time In Position": random.choice(["1 year", "2 years", "3 years", "4 years", "5 years"]),
        "Mobility": ', '.join(random.sample(continents, k=random.randint(1, 3))),
        "Position Band": random.choice(["B1", "B2", "B3", "B4"]),
        "Employee Band": random.choice(["B1", "B2", "B3", "B4"]),
        "Readiness Level":""
    }

employees = [generate_employee(i) for i in range(1, 201)]

# Exportar a JSON
with open('employees.json', 'w') as file:
    json.dump(employees, file, indent=4)
