---
# Home page. Sections are listed in page order; each has an id (its #anchor).
layout: home.njk  # home page template
title: "Christian Scharen"  # browser tab + share title
description: "Exploring the intersections of faith, culture, and the art of living through deep theological grounding and honest storytelling."  # meta description
image: /assets/images/christianscharen-author.webp  # hero photo + share image

# Top of page
hero: 
 id: "home"
 title: Christian Scharen  # big heading; switch to keywords

# Bio beside the photo; buttons live in site.yaml contact.links
about: 
  title: About
  id: about
  image: /assets/images/christian-scharen-photo.webp  # 4:5 crop; -480/-800/-1200 sizes used automatically
  text: |
    Christian Scharen is the Gordon Braatz Chair and Professor of Practical Theology at the Lutheran School of Theology at Chicago. He is author of two forthcoming books dealing with America's—and his family's—pioneer past. *After Laura: Notes on Inheriting a Pioneer Legacy in America* will be published by TBA in late 2027. *Custer Died for Our Sins: A Practical Theology of Repair* will be published by Fortress Press also in August 2027. He has written more than a dozen other books and scores of articles, chapters, and reports on a wide variety of topics. An ordained Lutheran pastor, he received his PhD in Religion from Emory University. Raised in Montana, he currently lives in Chicago with his wife and French bulldog.

# Latest book
custer: 
  info: Latest Release  # small label above the title
  id: "custer"
  image: /assets/images/bookcover.webp  # full size, opens on click
  thumbnail: /assets/images/bookcover_tn.webp  # shown on the page
  title: Custer Died For Our Sins
  description: How might North American Christian inheritors of a pioneer settler past work toward repair?  # subtitle
  text: | 
      Scharen traces the intertwined stories of the Ingalls and Deloria families on lands near **De Smet, South Dakota**, offering theological grounding for speaking complicated truths and resources for moving toward practical actions that repair relationships.
  button: 
    text: Order Now
    url: "https://www.fortresspress.com/store/product/9798341902497/Custer-Died-for-Our-Sins"
  button1:  # second button; hidden while url is "#"
    text: Read Excerpt
    url: "#"
  blockquote:  # pull quote
    text: A brilliant, deeply personal, and bracingly honest exploration of the injustice at the root of American pioneer mythology. 

# Forthcoming memoir
after_laura: 
  title: After Laura
  id: after-laura
  info: Forthcoming Memoir
  image: /assets/images/dad-and-chris.webp
  text:  # one entry per paragraph
    - article: |
         When Christian Scharen’s father died, he knew he finally would have to face his complicated relationship to his father—and his father’s **famous American pioneer story**. His childhood in Montana and Wyoming was formed by the pioneer tales of Laura Ingalls Wilder, but he’d never grappled with the fact that they were his family stories, too.
    - article: |
         He resolved to drive west from Pepin, Wisconsin, where his great-grandmother Lottie and her double-cousin Laura were both born in 1867. He stopped to visit the land where the Ingalls homesteaded as well as sites important to the Indigenous peoples whose land it was prior to the pioneers’ arrival.
    - article: |
         Along the way, he discovered the awful truth of land theft and genocide perpetrated against Native Nations, a truth his own family stories elide. At turns loving and heart-wrenching, this book looks for—and finds— hard won healing with a father, even as its explores repair required for healing a nation’s relationship with its original occupants and with the land itself.
  button: 
    text: Order Now
    url: "#"

# Research grid (2 columns on laptops)
research:
  id: research
  title: Research
  button: Visit project  # label on every project button
  items:
    - title: Learning Pastoral Imagination
      description: An eighteen-year qualitative, longitudinal research project on learning ministry in practice in collaboration with the Rev. Dr. Eileen Campbell-Reed.
      url: https://pastoralimagination.com/
    - title: Future Church Pilots
      description: A Lilly Endowment, Inc. funded project on experimental churches and other spiritual gatherings seeking to understand the shape of the church’s future through learning from the vanguard of church today.
      url: https://www.futurechurchpilots.org/
    - title: Beyond the Land Acknowledgement
      description: An ongoing initiative of research, writing, and activism focused on telling a truer story of white settler history in the United States and exploring pathways for repair in relationship to Indigenous peoples and the land.
      url: https://louisville-institute.org/our-impact/awards/pastoral-study-project/14907/

# Left column; same keys as speaking
newsletter: 
  title: Newsletter
  id: newsletter
  info: Stay Updated
  text: Subscribe to my Substack for updates, essays, and reflections on theology, culture, and repair.
  button: 
    text: Visit Substack
    url: https://substack.com/@christianscharen
  note: Also I find Substack so frustrating to figure out how to customize so if you have anyone you know who is savvy and would help me, let me know.  # italic note under the button

# Right column
speaking: 
  id: speaking
  info: Engagements
  title: Speaking
  text: Here are the events where I am teaching, speaking, book signing, or preaching. If you’d like to inquire about having me for your event, please email with your details.
  button:
    text: Email Christian  # no url: uses site.author.email
  note: "Please note I use a sliding scale based on ability to pay, and 50% of my speaking fees support Indigenous organizations and causes like NDN Collective’s Landback organizing, the Mary Sully Foundation, Woyatan Lutheran Church in Rapid City, South Dakota."

# Latest posts list (site.yaml featured_tags)
writing: 
  id: writing
  title: Other Writing
  info: Archives & Essays
  button: 
    text: Explore All
    url: "/writings/"
---
