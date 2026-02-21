import requests
import json
import time

# ==========================================
# ⚙️ CONFIGURATION
# ==========================================
BASE_URL = "https://api.zuuu.uz"
API_POSTS_URL = f"{BASE_URL}/api/posts/"
API_TOKEN_URL = f"{BASE_URL}/api/token/" 

# 🔒 CREDENTIALS
USERNAME = "main"
PASSWORD = "BlogForDev" # <--- Update this!

# 🔢 CATEGORY PKs (From your JSON output)
IELTS_ID = 1
SAT_ID = 2

# ==========================================
# 🔑 AUTHENTICATION
# ==========================================

def get_token():
    try:
        response = requests.post(API_TOKEN_URL, json={"username": USERNAME, "password": PASSWORD})
        if response.status_code == 200:
            return response.json().get("access")
        print(f"❌ Auth Failed: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def create_post(data, token):
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    response = requests.post(API_POSTS_URL, headers=headers, json=data)
    if response.status_code == 201:
        print(f"✅ Success: {data['title']}")
    else:
        print(f"❌ Failed: {data['title']} | Response: {response.text}")

# ---------------------------------------------------------
# 📝 1200+ CHARACTER POSTS
# ---------------------------------------------------------

posts = [
    {
        "title": "IELTS Writing Task 2: Advanced Opinion Essay Mastery",
        "category": IELTS_ID,
        "content": """
            <h2>The Complexity of the Opinion Essay</h2>
            <p>The IELTS Writing Task 2 Opinion Essay, often referred to as an 'Agree or Disagree' essay, is a significant challenge for many students aiming for a Band 7.5 or higher. The primary reason for failure is not usually a lack of English knowledge, but rather a lack of structured critical thinking and logical progression. To succeed, you must present a clear position that is maintained throughout the entire 250-word response.</p>
            
            <h3>Understanding the 'To What Extent' Question</h3>
            <p>Most prompts will ask "To what extent do you agree or disagree?" This allows you three options: total agreement, total disagreement, or a balanced view. For most candidates, taking a strong side is often safer and clearer. If you agree, your two main body paragraphs must provide two distinct, well-developed reasons why you hold that view. For example, if the topic is about the necessity of space exploration, your first point could focus on technological advancement, and your second could focus on the long-term survival of the human race.</p>

            <h3>The Structure of a High-Scoring Response</h3>
            <p>Your introduction must include a paraphrase of the question followed by a clear thesis statement. The thesis statement is the "roadmap" for the examiner. A strong example would be: "This essay will argue that while government spending on space research is high, the resulting technological breakthroughs in medicine and communication justify the investment."</p>
            
            <p>Each body paragraph should start with a <strong>Topic Sentence</strong>. This sentence defines the main idea. Follow this with a <strong>Supporting Sentence</strong> that explains the "why," and finally, an <strong>Example</strong>. Examples should be specific. Instead of saying "Many countries do this," say "In South Korea, government-led initiatives in satellite technology have significantly improved rural internet access."</p>

            <h3>Coherence and Cohesion: The Band 8 Bridge</h3>
            <p>Cohesion is about how you link your ideas. Avoid overusing simple connectors like 'Firstly' and 'Secondly'. Instead, use more sophisticated transition phrases like 'It is also worth considering that...', 'Conversely...', or 'A compelling illustration of this is...'. This variety shows the examiner that you have a flexible command of the language. Furthermore, ensure that each paragraph has one central idea. Mixing too many ideas in one paragraph leads to confusion and a lower score in the Coherence and Cohesion criteria.</p>

            <h3>The Conclusion: No New Ideas</h3>
            <p>Your conclusion should simply summarize your main points and restate your thesis. Many students make the fatal mistake of introducing a new argument in the final paragraph. This is penalized heavily. Instead, focus on a synthesis of your arguments and perhaps a final thought on the future implications of the topic. This structure ensures that your essay is a complete, logically sealed unit of thought.</p>
        """,
        "seo_title": "Mastering IELTS Writing Task 2 Opinion Essays 2026",
        "seo_description": "A deep dive into structuring Band 8 IELTS Writing Task 2 Opinion essays. Learn how to write a thesis, body paragraphs, and cohesive transitions.",
        "seo_keywords": "IELTS Writing Task 2, Opinion Essay, Agree or Disagree, IELTS tips, Band 8 writing",
        "is_indexable": True
    },
    {
        "title": "Digital SAT Math: The Desmos Revolution and Why It Matters",
        "category": SAT_ID,
        "content": """
            <h2>The Shift from Paper to Digital</h2>
            <p>The Digital SAT (DSAT) has fundamentally changed how students approach the Math section. With the introduction of the built-in Desmos Graphing Calculator throughout the entire math portion, the test has moved away from testing raw calculation speed toward testing mathematical logic and strategic tool usage. If you are still solving every problem with a pencil and paper, you are likely putting yourself at a significant disadvantage in terms of time management.</p>

            <h3>Leveraging Desmos for Algebraic Efficiency</h3>
            <p>Consider a standard 'System of Equations' problem. On the old paper SAT, you would use substitution or elimination, which might take 60 to 90 seconds and carry a risk of sign errors. On the Digital SAT, you can simply type both equations into the Desmos interface. The solution is the intersection of the two lines. By clicking on that point, you get the answer in seconds. This speed allows you to bank time for the harder 'Word Problems' that require more careful reading.</p>

            <h3>Visualizing Functions and Constants</h3>
            <p>Desmos is not just for finding intersections; it is an incredible tool for visualizing how constants affect functions. Questions often ask about the "vertex form" of a parabola or how changing a coefficient shifts a graph. By using the 'Slider' feature in Desmos, you can physically see the graph shift left, right, up, or down. This visual feedback turns abstract algebraic concepts into concrete visual data, making it much harder to make a conceptual error.</p>

            <h3>Critical Formulas You Still Need to Know</h3>
            <p>Even with a calculator, certain formulas are essential for speed. You should not have to type the entire quadratic formula into Desmos if you can recognize a perfect square trinomial or use the discriminant ($b^2 - 4ac$) to determine the number of solutions a quadratic equation has. Additionally, understanding circle equations $(x-h)^2 + (y-k)^2 = r^2$ is vital, as these often appear in questions where you must identify the center and radius of a circle from its graphed representation.</p>

            <h3>The Strategy of Time Allocation</h3>
            <p>The DSAT Math section is adaptive. This means your performance on the first module determines the difficulty of the second. To reach the 700-800 score range, you must be flawless on the easy and medium questions in Module 1 to ensure you get the "Hard" version of Module 2. The calculator is your best friend here; use it to double-check your manual calculations, even on simple arithmetic, to eliminate "silly mistakes" that could cost you a high-difficulty placement.</p>
        """,
        "seo_title": "Digital SAT Math Desmos Strategies & Formula Guide",
        "seo_description": "Maximize your Digital SAT Math score by mastering the Desmos calculator. Learn shortcuts for algebra, geometry, and time management.",
        "seo_keywords": "Digital SAT Math, Desmos tips, SAT shortcuts, SAT algebra, math formulas",
        "is_indexable": True
    }
]

# ---------------------------------------------------------
# EXECUTION
# ---------------------------------------------------------

def run():
    token = get_token()
    if not token: return
    print("-------------------------------------------------")
    for post in posts:
        create_post(post, token)
        time.sleep(0.5)
    print("-------------------------------------------------")
    print("✨ Seeding Complete!")

if __name__ == "__main__":
    run()
