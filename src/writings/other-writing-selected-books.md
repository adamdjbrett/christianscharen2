---
title: "Other Writing: Selected Books"
date: 2026-05-15
author: Christian Scharen
tags:
  - writing
  - books
description: "Selected books by Christian Scharen."
templateEngineOverride: njk,md
---

# Other Writing: Selected Books

{# Built from site.yaml selected_books, the same list as the home page grid. #}
{% for group in site.selected_books.groups %}
## {{ group.title }}

{% for book in group.items %}
<div class="book-entry">
{% picture book.image, book.name + " book cover" %}
<div>
<h3>{{ book.name }}</h3>
{% if book.subtitle %}<p><em>{{ book.subtitle }}</em></p>{% endif %}
{% if book.authors %}<p class="text-muted">{{ book.authors }}</p>{% endif %}
{% if book.publisher %}<p class="text-muted small">{{ book.publisher }}</p>{% endif %}
{% if book.description %}<p>{{ book.description }}</p>{% endif %}
<p><a href="{{ book.url }}">More about {{ book.name }}</a></p>
</div>
</div>

{% endfor %}
{% endfor %}
