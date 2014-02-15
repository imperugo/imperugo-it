# tostring.it

This is my blog build using [Jekyll](http://jekyllrb.com/). The skin is based on [Haacked.com](https://github.com/Haacked/haacked.com) repository.

## Testing

[HTML::Proofer](https://github.com/gjtorikian/html-proofer) is set up to validate all links within the project.  You can run this locally to ensure that your changes are valid:

```shell
bundle install
bundle exec rake test
```

## Add new post
```ruby
rake post title="Hello World"
```

## Add new page
Create pages easily via rake task:

$ rake page name="about.md"
Create a nested page:

$ rake page name="pages/about.md"
Create a page with a "pretty" path:

$ rake page name="pages/about"
# this will create the file: ./pages/about/index.html
The rake task automatically creates a page file with properly formatted filename and YAML Front Matter as well as includes the Jekyll Bootstrap "setup" file.