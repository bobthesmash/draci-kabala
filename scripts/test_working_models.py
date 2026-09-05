import urllib.request
import json
import time

key = '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'

# Fetch all models
req = urllib.request.Request('https://integrate.api.nvidia.com/v1/models', headers={'Authorization': f'Bearer {key}'})
res = urllib.request.urlopen(req)
all_models = [m['id'] for m in json.loads(res.read().decode('utf-8')).get('data', [])]

print(f"Total models in list: {len(all_models)}", flush=True)

# Test nemotron first
models_to_test = [
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    'nvidia/nemotron-nano-3-30b-a3b',
    'nvidia/nemotron-4-340b-instruct',
    'meta/llama-3.2-11b-vision-instruct',
    'meta/llama-3.2-90b-vision-instruct',
    'deepseek-ai/deepseek-v4-flash-0731',
    'deepseek-ai/deepseek-v4-pro-0813',
    'nv-mistralai/mistral-nemo-12b-instruct',
    'mistralai/mistral-7b-instruct-v0.3'
]

working = []
for m in models_to_test:
    t0 = time.time()
    try:
        r = urllib.request.Request('https://integrate.api.nvidia.com/v1/chat/completions',
            headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
            data=json.dumps({
                'model': m,
                'messages': [{'role': 'user', 'content': 'Ahoj!'}],
                'max_tokens': 15,
                'stream': False
            }).encode('utf-8'))
        resp = urllib.request.urlopen(r, timeout=6)
        data = json.loads(resp.read().decode('utf-8'))
        dt = round(time.time() - t0, 2)
        ans = data['choices'][0]['message']['content'].strip()
        print(f"SUCCESS: {m} ({dt}s) -> {ans[:50]}", flush=True)
        working.append(m)
    except Exception as e:
        print(f"FAIL: {m} -> {e}", flush=True)

print(f"\nWorking list: {working}", flush=True)
