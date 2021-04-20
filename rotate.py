import bpy
import sys
import argparse
from math import radians, degrees

class ArgumentParserForBlender(argparse.ArgumentParser):
    """
    This class is identical to its superclass, except for the parse_args
    method (see docstring). It resolves the ambiguity generated when calling
    Blender from the CLI with a python script, and both Blender and the script
    have arguments. E.g., the following call will make Blender crash because
    it will try to process the script's -a and -b flags:
    >>> blender --python my_script.py -a 1 -b 2

    To bypass this issue this class uses the fact that Blender will ignore all
    arguments given after a double-dash ('--'). The approach is that all
    arguments before '--' go to Blender, arguments after go to the script.
    The following calls work fine:
    >>> blender --python my_script.py -- -a 1 -b 2
    >>> blender --python my_script.py --
    """

    def _get_argv_after_doubledash(self):
        """
        Given the sys.argv as a list of strings, this method returns the
        sublist right after the '--' element (if present, otherwise returns
        an empty list).
        """
        try:
            idx = sys.argv.index("--")
            return sys.argv[idx+1:] # the list after '--'
        except ValueError as e: # '--' not in the list:
            return []

    # overrides superclass
    def parse_args(self):
        """
        This method is expected to behave identically as in the superclass,
        except that the sys.argv list will be pre-processed using
        _get_argv_after_doubledash before. See the docstring of the class for
        usage examples and details.
        """
        return super().parse_args(args=self._get_argv_after_doubledash())

parser = ArgumentParserForBlender()

# Defaults origin to Sydney
parser.add_argument('--origin_longitude',default=151.209900, type=float, help='Origin longitude in degrees, defaults to Sydney')
parser.add_argument('--origin_latitude',default=-33.865143, type=float, help='Origin latitude in degrees, defaults to Sydney')

# Defaults destination to Sao Paulo
parser.add_argument('--destination_longitude',default=-46.6, type=float, help='Destination longitude in degrees, defaults to São Paulo')
parser.add_argument('--destination_latitude',default=23.6, type=float, help='Destination latitude in degrees, defaults to São Paulo')

# Sets last frame for the animation
parser.add_argument('--destination_frame',default=60, type=int, help='Last frame for the animation')

args = parser.parse_args()

origin_longitude = args.origin_longitude
origin_latitude = args.origin_latitude
destination_longitude = args.destination_longitude
destination_latitude = args.destination_latitude
destination_frame = args.destination_frame

if destination_frame > 250:
    sys.exit('The maximum number of frames is 250.')

print(f'Origin set at E {origin_longitude} N {origin_latitude}')
print(f'Destination set at E {destination_longitude} N {destination_latitude}')

print(f'Starting program...')

scene = bpy.context.scene
bpy.context.scene.frame_end = destination_frame
rotator  = scene.objects['Camera Rotator']
camera = bpy.data.cameras['Camera.001']

# Inverts latitude
origin_latitude = origin_latitude * -1
destination_latitude = destination_latitude * -1

# Converts degrees to radians
origin_radians_x = radians(origin_latitude)
origin_radians_z = radians(origin_longitude)
destination_radians_x = radians(destination_latitude)
destination_radians_z = radians(destination_longitude)


# Sets keyframes on object rotator
rotator.rotation_euler[0] = origin_radians_x
rotator.rotation_euler[1] = 0
rotator.rotation_euler[2] = origin_radians_z
rotator.keyframe_insert(data_path='rotation_euler', frame=1)
print('Origin keyframe set at frame 1')

rotator.rotation_euler[0] = destination_radians_x
rotator.rotation_euler[1] = 0
rotator.rotation_euler[2] = destination_radians_z
rotator.keyframe_insert(data_path='rotation_euler', frame=destination_frame)
print(f'Destination keyframe set at frame {destination_frame}')

# Sets camera keyframe
camera.lens = 20
camera.keyframe_insert(data_path='lens', frame=1)
camera.lens = 50
camera.keyframe_insert(data_path='lens', frame=destination_frame)

print('All done')