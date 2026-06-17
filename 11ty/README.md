# 11ty

[11ty](https://www.11ty.dev/) is a static site generator.

This directory serves as a playground for exploring 11ty's capabilities with the
intent of integrating it into my infrastructure and development process.

Specifically, I want to figure out if it allows the following:

- Use React in templates/layouts to provide interactivity on specific
  pages/components.

- Semantic parsing of html/jsx tags while building.

    I want to extract the text of specific tags such as <p></p> so that I can
    process it and eventually replace it.

# Using React in templates/layouts

There are multiple methods to achieve the intended effect.

1. Server side rendering

    React must be made available at client side either through a cdn or bundled
    at build time. In both cases the <script></script> tag is utilized.

    The components/pages using React must get rendered statically through the
    use of the function **renderToStaticMarkup** found in the library
    **react-dom/server**.

    If these components need to make use of the full capability offered by React
    (such as using events like onClick) they will need to be hydrated on client
    side. To hydrate a component one must make use of the **hydrateRoot**
    function found in the library **react-dom/client**.

2. Client side rendering
Check the branch 11ty/using-react for an example of how to achieve the intended
effect.


# Parsing and processing html/jsx tags
# Resources
