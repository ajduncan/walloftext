# walloftext #

A wall of text for persistent community driven fun.

# Usage #

To run locally:

    $ vagrant up

# Caveats #

If you use hiredis with redis, be sure to rebuild it whenever you upgrade your version of node. 
There are mysterious failures that can happen between node and native code modules after a node upgrade.
