# Customer Ticket Classifier

## How to run this project 
clone the repo 
python -m http.server 3000
### if using UV
cd into the project folder 
do

`uv sync`

Add the environment variables with from `env.example` and rename it to the `.env`
Then do `uv run fastapi run`

And backend is now running on http://localhost:8000


### direct python
create virtual environment
- `python -m venv .venv`

For Command Prompt, use .venv\Scripts\activate.bat. For PowerShell, use .venv\Scripts\Activate.ps1

Install dependencies using pip install -r requirements.txt

add .env with proper environment variables

do `fastapi run`

all set


### frontend 
cd into the frontend 

- `python -m http.server 3000`
in frontend folder runthis and open the `http://localhost:3000`

### api we provide

```bash
curl -X POST http://localhost:8000/api/classify/batch/ -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{
  "messages":
  [
"Please delete my account permanently.",
"My account was hacked yesterday.",
"Amazing... another bug after the update."
  ]
}'
```

wwe provide the http://localhost:8000/api/classify/batch/ with body which can take multiple messages from the list and output the 


```json
{
  "total": 3,
  "results": [
    {
      "message": "Please delete my account permanently.",
      "category": "Account",
      "confidence": 1.0,
      "billing": false,
      "needed_human": true,
      "priority": "P2"
    },
    {
      "message": "My account was hacked yesterday.",
      "category": "Security",
      "confidence": 1.0,
      "billing": false,
      "needed_human": true,
      "priority": "P0"
    },
    {
      "message": "Amazing... another bug after the update.",
      "category": "Complaint",
      "confidence": 1.0,
      "billing": false,
      "needed_human": true,
      "priority": "P2"
    }
  ]
}
```

max limit is 30 and min limit is 1.



